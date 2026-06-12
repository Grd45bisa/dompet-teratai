export async function extractPdfText(buffer: Buffer): Promise<string> {
    const { PDFParse } = await import('pdf-parse');

    let parser: InstanceType<typeof PDFParse> | null = null;

    try {
        parser = new PDFParse({ data: new Uint8Array(buffer) });
        const result = await parser.getText();
        return result.text.trim();
    } finally {
        await parser?.destroy();
    }
}
