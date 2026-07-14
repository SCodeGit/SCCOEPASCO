import "./globals.css";
import {ThemeProvider} from "@/components/ThemeProvider";

export const metadata={
title:"SCode Academic AI",
description:"AI academic assistant for Colleges of Education"
};


export default function RootLayout({
children,
}:{
children:React.ReactNode
}){

return(
<html lang="en">
<body>
<ThemeProvider>
{children}
</ThemeProvider>
</body>
</html>
)

}
