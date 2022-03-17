import { BigInt } from "@graphprotocol/graph-ts"
import {
  Transfer
} from "../generated/BAYC/BAYC"
import { Owner, ApeTransfer } from "../generated/schema"

export function handleTransfer(event: Transfer): void {
  const transferId = `${event.transaction.hash.toHex()}-${event.logIndex.toString()}`;
  const to = event.params.to;
  const from = event.params.from;
  const tokenId = event.params.tokenId;

  const transfer = new ApeTransfer(transferId);

  transfer.from = from;
  transfer.to = to;
  transfer.tokenId = tokenId;
  transfer.timestamp = event.block.timestamp;

  transfer.save()

  const newOwnerId = to.toHex();
  const oldOwnerId = from.toHex();

  let newOwner = Owner.load(newOwnerId);
  const oldOwner = Owner.load(oldOwnerId);

  if(oldOwner) {
    for(let i = 0; i < oldOwner.tokenIds.length; i++) {
      if(oldOwner.tokenIds[i] == tokenId) {
        const newTokenIds = oldOwner.tokenIds;

        newTokenIds.splice(i, 1);

        oldOwner.tokenIds = newTokenIds;
        oldOwner.tokenCount = oldOwner.tokenCount - BigInt.fromI32(1);

        oldOwner.save();

        break;
      }
    }
  }

  if(!newOwner) {
    newOwner = new Owner(newOwnerId);

    newOwner.tokenCount = BigInt.fromI32(0);
    newOwner.address = to;
    newOwner.tokenIds = [];
  }

  const tokenIds = newOwner.tokenIds;

  tokenIds.push(tokenId);

  newOwner.tokenIds = tokenIds;
  newOwner.tokenCount = newOwner.tokenCount + BigInt.fromI32(1);

  newOwner.save();
}
