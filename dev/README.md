# How to Generate short-words.txt

The core files are from [WordNet: A Lexical Database for English](https://wordnet.princeton.edu/).
Download and unzip `WordNet-3.0.tar.gz`.

1. Save `index.adj`, `index.adv`, `index.noun`, `index.verb`, and `index.sense` in the `./data` directory.
1. `data/index.noun` and `data/index.sense` are inputs to `dev/curate.js`. The output is the top 6000 nouns — call it `data/nouns6000.txt`.
1. `data/nouns6000.txt` is input to `dev/filter.js`, which strips words containing spaces, hyphens, or periods, and removes words shorter than 3 or longer than 6 characters. Call the result `data/nouns3-6-curated.txt`.
1. Manually scan `data/nouns3-6-curated.txt` to remove ethnonyms, demonyms, and anything political, religious, expletive, or otherwise family-unfriendly.
1. Repeat steps 2–4 for `data/index.adj`, `data/index.adv`, and `data/index.verb`.
1. Concatenate all four curated lists:
   ```
   cat adj3-6-curated.txt adv3-6-curated.txt noun3-6-curated.txt verb3-6-curated.txt > short-list.txt
   ```
