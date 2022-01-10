# Simple NFT Metadata Dumper

NFT Metadata Dumper

<!-- toc -->

- [Usage](#usage)
<!-- tocstop -->

# Usage

<!-- usage -->

Ensure you have an [Alchemy API Key](https://docs.alchemy.com/alchemy/introduction/getting-started) on hand.

```sh-session
$ yarn install
$ yarn build

$ ./bin/run dump <ALCHEMY-KEY> <NFT-CONTRACT-ADDRESS> <MAX>
Retrieving <MAX> NFTs for <NFT-NAME> (<NFT-CONTRACT-ADDRESS>)
Retrieving NFT metadata for token_id=0.
Retrieving NFT metadata for token_id=1.
...
Retrieving NFT metadata for token_id=<MAX>.

$ ./bin/run dump <ALCHEMY-KEY> <NFT-CONTRACT-ADDRESS>
Retrieving <NFT-SUPPLY> NFTs for <NFT-NAME> (<NFT-CONTRACT-ADDRESS>)
Retrieving NFT metadata for token_id=0.
Retrieving NFT metadata for token_id=1.
...
Retrieving NFT metadata for token_id=<TOTAL-SUPPLY>.

```

NFT metadata is dumped to `output/<name>-<dumped_count>-metadata.json`
