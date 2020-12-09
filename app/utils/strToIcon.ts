export function strToIcon(s: string): string {
    const str = s
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .replace(/\s/g, "");

    return `https://i0.wp.com/cdn.auth0.com/avatars/${str
        .substring(0, 2)
        .toLowerCase()}.png`;
}
