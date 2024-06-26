/// <reference types="@sveltejs/kit" />

// Guide from https://kit.svelte.dev/docs/service-workers#type-safety
//  and from https://www.youtube.com/watch?v=_wiOcdEVgks&ab_channel=JoyofCode

import { build, files, prerendered, version } from '$service-worker'

// Create a unique cache name for this deployment
const CACHE = `cache-${version}`

const ASSETS = [
    ...build, // the app itself
    ...files,  // everything in `static`
    ...prerendered // prerendered pages
]

self.addEventListener('install', event =>
{
    // Create a new cache and add all files to it
    async function addFilesToCache()
    {
        const cache = await caches.open(CACHE)
        await cache.addAll(ASSETS)
    }

    event.waitUntil(addFilesToCache())
})


self.addEventListener('activate', event =>
{
    // Remove previous cached data from disk
    async function deleteOldCaches()
    {
        for (const key of await caches.keys())
        {
            if (key !== CACHE) await caches.delete(key)
        }
    }

    event.waitUntil(deleteOldCaches())
})


self.addEventListener('fetch', event =>
{
    // ignore POST requests etc
    if (event.request.method !== 'GET') return

    async function respond()
    {
        const url = new URL(event.request.url)
        const cache = await caches.open(CACHE)

        // `build`/`files` can always be served from the cache
        if (ASSETS.includes(url.pathname))
        {
            const response = await cache.match(url.pathname)

            if (response)
            {
                return response
            }
        }

        // for everything else, try the network first, but
        // fall back to the cache if we're offline
        try
        {
            const response = await fetch(event.request)

            // if we're offline, fetch can return a value that is not a Response
            // instead of throwing - and we can't pass this non-Response to respondWith
            if (!(response instanceof Response))
            {
                throw new Error('invalid response from fetch')
            }

            if (response.status === 200)
            {
                cache.put(event.request, response.clone())
            }

            return response
        } catch (err)
        {
            const response = await cache.match(event.request)

            if (response)
            {
                return response
            }

            // if there's no cache, then just error out
            // as there is nothing we can do to respond to this request
            throw new Error('Offline! Please connect to the internet to continue.')
        }
    }

    event.respondWith(respond())
})


// Immediately activate the new service worker when there's an update and it's installed
// Even though we call window.location.reload(), the new service worker won't take control until the tab is closed and reopened
// This is a workaround to make the new service worker take control immediately
self.addEventListener('message', event =>
{
    if (event.data && event.data.type === 'SKIP_WAITING')
    {
        self.skipWaiting()
    }
})