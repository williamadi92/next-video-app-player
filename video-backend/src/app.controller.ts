import { Controller, Get, Req, Res, Header, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Controller()
export class AppController {
  @Get('video')
  @Header('Content-Type', 'video/mp4')
  async streamVideo(@Req() req: Request, @Res() res: Response) {
    const videoPath = path.join(process.cwd(), 'videos', 'sample.mp4');

    if (!fs.existsSync(videoPath)) {
      return res.status(HttpStatus.NOT_FOUND).send('Video not found');
    }

    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize || end >= fileSize) {
        return res
          .status(HttpStatus.REQUESTED_RANGE_NOT_SATISFIABLE)
          .send('Range Not Satisfiable');
      }

      const chunkSize = end - start + 1;
      const file = fs.createReadStream(videoPath, { start, end });

      const headers = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': 'video/mp4',
      };

      res.writeHead(206, headers);
      file.pipe(res);
    } else {
      const headers = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(200, headers);
      fs.createReadStream(videoPath).pipe(res);
    }
  }
}
