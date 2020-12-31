import { ISerializedMessage } from '../reducers/messages';

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

    const chunkedMessages: ISerializedMessage[][] = [[]];
    for (let i = 0; i < messageIDs.length; i++) {
        if (chunkedMessages[0] === undefined) {
            chunkedMessages.push([]);
        }

        const currentMessage = threadMessages[messageIDs[i]];

        if (chunkedMessages[chunkedMessages.length - 1].length === 0) {
            chunkedMessages[chunkedMessages.length - 1].push(currentMessage);
        } else {
            if (
                chunkedMessages[chunkedMessages.length - 1][0].sender ===
                currentMessage.sender
            ) {
                const firstMessageTime = new Date(
                    chunkedMessages[chunkedMessages.length - 1][0].timestamp
                );
                const thisMessageTime = new Date(currentMessage.timestamp);
                const chunkTimeLength =
                    thisMessageTime.getTime() - firstMessageTime.getTime();

                // three minutes
                if (chunkTimeLength < 1000 * 60 * 3) {
                    chunkedMessages[chunkedMessages.length - 1].push(
                        currentMessage
                    );
                    // start a new chunk if the chunk is too old
                } else {
                    chunkedMessages.push([]);
                    chunkedMessages[chunkedMessages.length - 1].push(
                        currentMessage
                    );
                }
            } else {
                chunkedMessages.push([]);
                chunkedMessages[chunkedMessages.length - 1].push(
                    currentMessage
                );
            }
        }
    }
    return chunkedMessages;
}
