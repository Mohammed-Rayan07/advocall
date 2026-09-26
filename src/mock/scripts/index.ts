// Owner: YASO (folder src/mock/). Register every demo script here.
import type { DemoScript } from "@/types";
import { quickScript } from "./quick";
import { upiScript } from "./upi";
import { ecomScript } from "./ecom";
import { refusalScript } from "./refusal";

export const DEMO_SCRIPTS: DemoScript[] = [quickScript, upiScript, ecomScript, refusalScript];
