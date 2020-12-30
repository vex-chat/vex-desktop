import { renderHook } from "@testing-library/react-hooks";

import { useDebounce } from "./useDebounce";

describe("useDebounce", () => {
    const props = {
        initialProps: { val: "" },
    };

    beforeEach(() => {
        // tell jest to mock all timeout functions
        jest.useFakeTimers("modern");
    });

    it("returns initial value", () => {
        const { result } = renderHook(() => useDebounce("", 200));

        expect(result.current).toBe("");
    });

    it("does not update the value before the delay", () => {
        const { result, rerender } = renderHook(
            ({ val }) => useDebounce(val, 200),
            props
        );

        rerender({ val: "hi" });
        jest.advanceTimersByTime(199);

        expect(result.current).toBe("");
    });

    it("updates the value after the delay", () => {
        const { result, rerender } = renderHook(
            ({ val }) => useDebounce(val, 200),
            props
        );

        rerender({ val: "hai" });
        jest.advanceTimersByTime(200);

        expect(result.current).toBe("hai");
    });

    it("resets the delay on value change", () => {
        const { result, rerender } = renderHook(
            ({ val }) => useDebounce(val, 200),
            props
        );

        jest.advanceTimersByTime(100);
        rerender({ val: "hello" });
        jest.advanceTimersByTime(199);

        expect(result.current).toBe("");
    });
});
