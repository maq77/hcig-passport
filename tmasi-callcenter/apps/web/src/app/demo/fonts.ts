import { Noto_Sans_Arabic, Poppins } from "next/font/google";

export const poppins = Poppins({ weight: ["400", "500", "600", "700"], subsets: ["latin", "latin-ext"], display: "swap", variable: "--font-poppins" });
export const notoArabic = Noto_Sans_Arabic({ weight: ["400", "500", "600"], subsets: ["arabic"], display: "swap", variable: "--font-arabic" });
