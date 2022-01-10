import { Command } from '@oclif/core';
import {
  AlchemyWeb3,
  createAlchemyWeb3,
  NftMetadataResponse
} from '@alch/alchemy-web3';
import asyncPool from 'tiny-async-pool';
import fs from 'fs';

let web3: AlchemyWeb3;

export default class Dump extends Command {
  static description = 'Dump NFT Data';

  static examples = [`$ ntf-dump 0x26BAdF693F2b103B021c670c852262b379bBBE8A`];

  static args = [
    {
      name: 'key',
      description: 'Alchemy API Key',
      required: true
    },
    {
      name: 'address',
      description: 'NFT Contract Address to dump',
      required: true
    },
    {
      name: 'max',
      description: 'Maximum number of NFTs to dump',
      required: false
    }
  ];

  /**
   * Retrieves ERC721 metadata for 0..<count> token IDs
   * @param address The smart contract address
   * @param count The number of token ids to retrieve metadata for
   * @returns An array of Alchemy API responses
   */
  private getMetadata = async (
    address: string,
    count: number
  ): Promise<NftMetadataResponse[]> => {
    /**
     * Retrives Alchemy metadata for a Token ID
     * @param token_id
     * @returns Alchemy API response
     */
    const getMetadataForTokenId = (token_id: number) =>
      new Promise<NftMetadataResponse>((resolve, reject) => {
        this.log(`Retrieving NFT metadata for token_id=${token_id}.`);
        web3.alchemy
          .getNftMetadata({
            contractAddress: address,
            tokenId: token_id.toString(),
            tokenType: 'erc721'
          })
          .then((data) => {
            this.log(`Received NFT metadata for token_id=${token_id}`);
            resolve(data);
          })
          .catch((err) => {
            this.log(`Failed to get NFT metadata for token_id=${token_id}`);
            reject(err);
          });
      });
    return await asyncPool(
      100,
      [...Array(count).keys()],
      getMetadataForTokenId
    ).catch((error) => {
      throw new Error(error);
    });
  };

  /**
   * Makes an eth call to retrieve the maxSupply from the NFT smart contract.
   *
   * Note: this assumes the contract at <address> conforms to the *optional* ERC721Enumerable interface
   *       as described here: https://eips.ethereum.org/EIPS/eip-721
   * @param address The smart contract address which contains a valid totalSupply() implementation
   * @returns The total supply of NFTs
   */
  private getNFTSupply = async (address: string) => {
    const contract = new web3.eth.Contract(
      [
        {
          inputs: [],
          name: 'totalSupply',
          outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
          stateMutability: 'view',
          type: 'function'
        }
      ],
      address
    );
    return Number.parseInt(await contract.methods.totalSupply().call());
  };

  async run(): Promise<void> {
    const {
      args: { key, address, max }
    } = await this.parse(Dump);

    web3 = createAlchemyWeb3(key);

    const count = max ? max : await this.getNFTSupply(address);

    const name = await (await web3.alchemy.getTokenMetadata(address)).name;

    this.log(`Retrieving ${count} NFTs for ${name} (${address})`);

    const metadata = await this.getMetadata(address, count).catch((err) => {
      this.log('Failed to get all NFT metadata', err);
    });

    const data = JSON.stringify(metadata);
    const outputdir = 'output';
    if (metadata) {
      if (!fs.existsSync(outputdir)) {
        fs.mkdirSync(outputdir);
      }
      fs.writeFile(
        `output/${name}-${count}-metadata.json`,
        data,
        (err: any) => {
          if (err) {
            throw err;
          }
          this.log('JSON data is saved.');
        }
      );
    }
  }
}
