import { writable } from 'svelte/store';

function createPersistedStore(key: string, startValue: Word)
{
    let initialValue = startValue;

    if (typeof localStorage !== 'undefined')
    {
        const storedValue = localStorage.getItem(key);
        if (storedValue)
        {
            initialValue = JSON.parse(storedValue);
        }
    }

    const { subscribe, set } = writable(initialValue);

    return {
        subscribe,
        set: (value: Word) =>
        {
            localStorage.setItem(key, JSON.stringify(value));
            set(value);
        }
    };
}

export const currWord = createPersistedStore('currWord', { word: '', definition: '' });