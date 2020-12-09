export function strToIcon(s: string): string {
    s.replace(/\s/g, "");

    return `https://i0.wp.com/cdn.auth0.com/avatars/${s
        .substring(0, 2)
        .toLowerCase()}.png`;
}
