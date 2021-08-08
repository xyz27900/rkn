import { DUMP_FILENAME, REPO_URL } from '@/config';
import { File } from '@/models/file';
import { AxiosReply, get } from '@/utils/get';

type GetFilesReply = File[];
type GetFileReply = {
  content: Buffer;
  sha: string;
} | null;

const getFiles = async (): AxiosReply<GetFilesReply> => {
  return await get<GetFilesReply>(REPO_URL);
};

const getFile = async (files: File[], filename: string): Promise<GetFileReply> => {
  const targetFile = files.find(item => item.name === filename);
  if (!targetFile) {
    return null;
  }

  const res = await get<Buffer>(targetFile.downloadUrl, { responseType: 'arraybuffer' });
  if (res.__state === 'success' && res.data) {
    return {
      content: res.data,
      sha: targetFile.sha,
    };
  }

  return null;
};

export const getDump = async (): Promise<GetFileReply> => {
  const res = await getFiles();
  if (res.__state === 'success' && res.data) {
    return await getFile(res.data, DUMP_FILENAME);
  } else {
    return null;
  }
};
