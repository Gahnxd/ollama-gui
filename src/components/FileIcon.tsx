import { File, FileImage, FileCode, FileText, FileTerminal, FileJson, FileCog, FileLock, FileSpreadsheet } from 'lucide-react';

export default function getFileIcon(fileType: string) {
    const codeFileTypes = ['js', 'ts', 'py', 'rb', 'java', 'cpp', 'c', 'go', 'rs', 'php', 'html', 'css'];
    const imageFileTypes = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'tiff', 'ico'];
    const configFileTypes = ['yml', 'yaml', 'toml'];
    const lockFileTypes = ['lock'];
    const textFileTypes = ['txt', 'md', 'markdown', 'mdx', 'tex', 'latex', 'bib'];
    const dataFileTypes = ['csv', 'tsv', 'xml', 'parquet'];

    if (fileType.includes('pdf')) return <FileText size={16} className="text-red-400" />;
    if (imageFileTypes.includes(fileType)) return <FileImage size={16} />;
    if (codeFileTypes.includes(fileType)) return <FileCode size={16} />;
    if (fileType.includes('sh')) return <FileTerminal size={16} />;
    if (textFileTypes.includes(fileType)) return <FileText size={16} />;
    if (fileType.includes('json')) return <FileJson size={16} />;
    if (configFileTypes.includes(fileType)) return <FileCog size={16} />;
    if (lockFileTypes.includes(fileType)) return <FileLock size={16} />;
    if (dataFileTypes.includes(fileType)) return <FileSpreadsheet size={16} />;
    return <File size={16} />;
}