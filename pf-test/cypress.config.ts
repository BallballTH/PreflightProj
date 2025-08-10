import { defineConfig } from 'cypress';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import fetch from 'node-fetch';

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      on('task', {
        async multipartRequest(opts: {
          url: string;
          method?: string;
          fields?: Record<string, string>;
          filePath?: string;
          fileField?: string;
          contentType?: string;
        }) {
          const fd = new FormData();

          for (const [key, value] of Object.entries(opts.fields || {})) {
            fd.append(key, value as string);
          }

          if (opts.filePath) {
            const absPath = path.resolve(opts.filePath);
            const buffer = await fs.promises.readFile(absPath);
            fd.append(opts.fileField || 'image', buffer, {
              filename: path.basename(absPath),
              contentType: opts.contentType || 'application/octet-stream',
            });
          }

          const res = await (fetch as any)(opts.url, {
            method: opts.method || 'POST',
            body: fd,
            headers: fd.getHeaders(), // สำคัญสำหรับ form-data บน node-fetch v2
          });

          let body: any = null;
          const text = await res.text();
          try { body = JSON.parse(text); } catch { body = text || null; }

          return { status: res.status, body };
        },
      });

      return config;
    },
  },
});
