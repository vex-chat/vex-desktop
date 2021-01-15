import type { ISerializedMessage } from "../reducers/messages";

/**
 * Chunks the messages into chunks of the same sender consecutively, so they can be displayed in
 * a smaller format.
 *
 *
 *
 * @param threadMessages The thread message object.
 */
export function chunkMessages(
    threadMessages: Record<string, ISerializedMessage>
): ISerializedMessage[][] {
    const messageIDs = Object.keys(threadMessages);

    const unsortedMessages = messageIDs.map((id) => threadMessages[id]);
    let sortedMessages = sortByTimeKey("timestamp", unsortedMessages);

    if (sortedMessages.length > 100) {
        sortedMessages = sortedMessages.slice(
            sortedMessages.length - 100,
            sortedMessages.length
        );
    }

    const chunkedMessages: ISerializedMessage[][] = [[]];
    for (const message of sortedMessages) {
        if (chunkedMessages[0] === undefined) {
            chunkedMessages.push([]);
        }

        if (chunkedMessages[chunkedMessages.length - 1].length === 0) {
            chunkedMessages[chunkedMessages.length - 1].push(message);
        } else {
            if (
                chunkedMessages[chunkedMessages.length - 1][0].sender ===
                message.sender
            ) {
                const firstMessageTime = new Date(
                    chunkedMessages[chunkedMessages.length - 1][0].timestamp
                );
                const thisMessageTime = new Date(message.timestamp);
                const chunkTimeLength =
                    thisMessageTime.getTime() - firstMessageTime.getTime();

                // three minutes
                if (chunkTimeLength < 1000 * 60 * 3) {
                    chunkedMessages[chunkedMessages.length - 1].push(message);
                    // start a new chunk if the chunk is too old
                } else {
                    chunkedMessages.push([]);
                    chunkedMessages[chunkedMessages.length - 1].push(message);
                }
            } else {
                chunkedMessages.push([]);
                chunkedMessages[chunkedMessages.length - 1].push(message);
            }
        }
    }
    return chunkedMessages;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function sortByTimeKey(key: string, array: any[]): any[] {
    return array.sort(function (a, b) {
        const keyA = new Date(a[key]);
        const keyB = new Date(b[key]);
        // Compare the 2 dates
        if (keyA < keyB) return -1;
        if (keyA > keyB) return 1;
        return 0;
    });
}
