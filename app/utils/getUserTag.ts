export function getUserTag(userID: string): string {
    return userID.slice(0, 4);
}
