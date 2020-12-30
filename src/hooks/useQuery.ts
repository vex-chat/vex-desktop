// A custom hook that builds on useLocation to parse

import { useLocation } from "react-router";

// the query string for you.
export function useQuery(): URLSearchParams {
    return new URLSearchParams(useLocation().search);
}
