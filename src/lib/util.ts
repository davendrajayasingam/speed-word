export function getRandomWord()
{
    return fetch("https://random-word-api.herokuapp.com/word")
        .then((res) => res.json())
        .then((data) => data?.[0] || "");
}

export function getDefinition(word: string)
{
    return fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
        .then((res) => res.json())
        .then(
            (data) => data?.[0]?.meanings?.[0]?.definitions?.[0]?.definition || ""
        );
}