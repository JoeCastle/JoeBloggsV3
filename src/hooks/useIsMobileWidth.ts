import { useEffect, useState } from "react";

/**
 * Used to determin whether the width of the page is mobile width.
 * @returns 
 */
export const useIsMobileWidth = (): boolean => {
    const [isMobile, setIsMobile] = useState<boolean>(false);

    useEffect(() => {
        const check = (): void => setIsMobile(window.innerWidth <= 600);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    return isMobile;
};
