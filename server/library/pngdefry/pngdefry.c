/* pngdefry.c v1.1 - public domain PNG reading/writing/modification, PNG writing
   See "unlicense" statement at the end of this file.

	[Jongware], 21-Jan-2012

	Attempts to repair -iphone "optimized" PNG images by removing the invalid chunk "CgBI",
	swapping pixel order from BGR(A) to RGB(A), and removing pre-multiplied alpha.

	Use with care. No guarantees.

	This program uses miniz.c (http://code.google.com/p/miniz/) by Rich Geldreich
	(Rich Geldreich <richgel99@gmail.com>, last updated May 27, 2011)
	Version used is included in the original file package.

	No-License Agreement
	====================
	This program is hereby put into the public domain, no limitations at all. Do with this code
	whatever you want, I don't care. (Well, replacing my name with yours and leaving everything
	else unchanged would be pretty lame.)
*/

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <strings.h>
#include <sys/types.h>

#include "miniz.c"


/** Global flags, set on the command line **/
int flag_Verbose = 0;
int flag_Process_Anyway = 0;
int flag_List_Chunks = 0;
int flag_Debug = 0;
int flag_UpdateAlpha = 1;
int repack_IDAT_size = 524288;	/* 512K -- seems a bit much to me, axually, but have seen this used */

int flag_Rewrite = 0;

char *suffix = NULL;
char *outputPath = NULL;

unsigned char png_magic_bytes[] = "\x89\x50\x4E\x47\x0D\x0A\x1A\x0A";

/** Chunk data comes here **/

struct chunk_t {
	unsigned int length;
	unsigned int id;
	unsigned char *data;
	unsigned int crc32;
};

int num_chunks = 0;
int max_chunks = 0;

struct chunk_t *pngChunks = NULL;


/** CRC32 generator for a block of data, thanks to Marc Autret
	(he wrote this original code in Javascript for use in InDesign!) **/

unsigned int CRC_256[] = {
	0, 0x77073096, 0xee0e612c, 0x990951ba, 0x76dc419, 0x706af48f, 0xe963a535, 0x9e6495a3, 0xedb8832, 0x79dcb8a4, 0xe0d5e91e, 0x97d2d988, 0x9b64c2b, 0x7eb17cbd, 0xe7b82d07, 0x90bf1d91,
	0x1db71064, 0x6ab020f2, 0xf3b97148, 0x84be41de, 0x1adad47d, 0x6ddde4eb, 0xf4d4b551, 0x83d385c7, 0x136c9856, 0x646ba8c0, 0xfd62f97a, 0x8a65c9ec, 0x14015c4f, 0x63066cd9, 0xfa0f3d63, 0x8d080df5,
	0x3b6e20c8, 0x4c69105e, 0xd56041e4, 0xa2677172, 0x3c03e4d1, 0x4b04d447, 0xd20d85fd, 0xa50ab56b, 0x35b5a8fa, 0x42b2986c, 0xdbbbc9d6, 0xacbcf940, 0x32d86ce3, 0x45df5c75, 0xdcd60dcf, 0xabd13d59,
	0x26d930ac, 0x51de003a, 0xc8d75180, 0xbfd06116, 0x21b4f4b5, 0x56b3c423, 0xcfba9599, 0xb8bda50f, 0x2802b89e, 0x5f058808, 0xc60cd9b2, 0xb10be924, 0x2f6f7c87, 0x58684c11, 0xc1611dab, 0xb6662d3d,
	0x76dc4190, 0x1db7106, 0x98d220bc, 0xefd5102a, 0x71b18589, 0x6b6b51f, 0x9fbfe4a5, 0xe8b8d433, 0x7807c9a2, 0xf00f934, 0x9609a88e, 0xe10e9818, 0x7f6a0dbb, 0x86d3d2d, 0x91646c97, 0xe6635c01,
	0x6b6b51f4, 0x1c6c6162, 0x856530d8, 0xf262004e, 0x6c0695ed, 0x1b01a57b, 0x8208f4c1, 0xf50fc457, 0x65b0d9c6, 0x12b7e950, 0x8bbeb8ea, 0xfcb9887c, 0x62dd1ddf, 0x15da2d49, 0x8cd37cf3, 0xfbd44c65,
	0x4db26158, 0x3ab551ce, 0xa3bc0074, 0xd4bb30e2, 0x4adfa541, 0x3dd895d7, 0xa4d1c46d, 0xd3d6f4fb, 0x4369e96a, 0x346ed9fc, 0xad678846, 0xda60b8d0, 0x44042d73, 0x33031de5, 0xaa0a4c5f, 0xdd0d7cc9,
	0x5005713c, 0x270241aa, 0xbe0b1010, 0xc90c2086, 0x5768b525, 0x206f85b3, 0xb966d409, 0xce61e49f, 0x5edef90e, 0x29d9c998, 0xb0d09822, 0xc7d7a8b4, 0x59b33d17, 0x2eb40d81, 0xb7bd5c3b, 0xc0ba6cad,
	0xedb88320, 0x9abfb3b6, 0x3b6e20c, 0x74b1d29a, 0xead54739, 0x9dd277af, 0x4db2615, 0x73dc1683, 0xe3630b12, 0x94643b84, 0xd6d6a3e, 0x7a6a5aa8, 0xe40ecf0b, 0x9309ff9d, 0xa00ae27, 0x7d079eb1,
	0xf00f9344, 0x8708a3d2, 0x1e01f268, 0x6906c2fe, 0xf762575d, 0x806567cb, 0x196c3671, 0x6e6b06e7, 0xfed41b76, 0x89d32be0, 0x10da7a5a, 0x67dd4acc, 0xf9b9df6f, 0x8ebeeff9, 0x17b7be43, 0x60b08ed5,
	0xd6d6a3e8, 0xa1d1937e, 0x38d8c2c4, 0x4fdff252, 0xd1bb67f1, 0xa6bc5767, 0x3fb506dd, 0x48b2364b, 0xd80d2bda, 0xaf0a1b4c, 0x36034af6, 0x41047a60, 0xdf60efc3, 0xa867df55, 0x316e8eef, 0x4669be79,
	0xcb61b38c, 0xbc66831a, 0x256fd2a0, 0x5268e236, 0xcc0c7795, 0xbb0b4703, 0x220216b9, 0x5505262f, 0xc5ba3bbe, 0xb2bd0b28, 0x2bb45a92, 0x5cb36a04, 0xc2d7ffa7, 0xb5d0cf31, 0x2cd99e8b, 0x5bdeae1d,
	0x9b64c2b0, 0xec63f226, 0x756aa39c, 0x26d930a, 0x9c0906a9, 0xeb0e363f, 0x72076785, 0x5005713, 0x95bf4a82, 0xe2b87a14, 0x7bb12bae, 0xcb61b38, 0x92d28e9b, 0xe5d5be0d, 0x7cdcefb7, 0xbdbdf21,
	0x86d3d2d4, 0xf1d4e242, 0x68ddb3f8, 0x1fda836e, 0x81be16cd, 0xf6b9265b, 0x6fb077e1, 0x18b74777, 0x88085ae6, 0xff0f6a70, 0x66063bca, 0x11010b5c, 0x8f659eff, 0xf862ae69, 0x616bffd3, 0x166ccf45,
	0xa00ae278, 0xd70dd2ee, 0x4e048354, 0x3903b3c2, 0xa7672661, 0xd06016f7, 0x4969474d, 0x3e6e77db, 0xaed16a4a, 0xd9d65adc, 0x40df0b66, 0x37d83bf0, 0xa9bcae53, 0xdebb9ec5, 0x47b2cf7f, 0x30b5ffe9,
	0xbdbdf21c, 0xcabac28a, 0x53b39330, 0x24b4a3a6, 0xbad03605, 0xcdd70693, 0x54de5729, 0x23d967bf, 0xb3667a2e, 0xc4614ab8, 0x5d681b02, 0x2a6f2b94, 0xb40bbe37, 0xc30c8ea1, 0x5a05df1b, 0x2d02ef8d
};

int crc32s (unsigned char *buf, int buf_length)
{
	unsigned int c = 0xffffffff;
	int i;
	for (i=0; i < buf_length; i++ )
		c = CRC_256[(c ^ buf[i]) & 0xff] ^ (c >> 8);

	return (c ^ 0xffffffff);
};

int get_long (FILE *f)
{
	return (fgetc(f)<<24) + (fgetc(f)<<16) + (fgetc(f)<<8) + fgetc(f);
}

int get_short (FILE *f)
{
	return (fgetc(f)<<8) + fgetc(f);
}

int read_long (void *src)
{
	return (((unsigned char *)src)[0]<<24) + (((unsigned char *)src)[1]<<16) + (((unsigned char *)src)[2]<<8) + ((unsigned char *)src)[3];
}


int init_chunk (FILE *f, unsigned int filelength)
{
	struct chunk_t one_chunk;
	unsigned char buf[8];

	if (fread (buf, 1,4, f) != 4)
	{
		if (feof(f))
			return 0;
		if (flag_Debug)
			printf ("    informational : failed to read chunk length\n");
		return -3;
	}

	one_chunk.length = (buf[0] << 24) + (buf[1] << 16) + (buf[2] << 8) + buf[3];

	if (one_chunk.length > filelength-4)
	{
		if (flag_Debug)
			printf ("    informational : chunk length %u larger than file\n", one_chunk.length);
		return -1;
	}

	one_chunk.data = (unsigned char *)malloc (one_chunk.length+4);
	if (one_chunk.data == NULL)
	{
		if (flag_Debug)
			printf ("    informational : no memory for chunk length %u\n", one_chunk.length);
		return -2;
	}
	if (fread (one_chunk.data, 1, one_chunk.length+4, f) != one_chunk.length+4)
	{
		if (flag_Debug)
			printf ("    informational : failed to read chunk length %u\n", one_chunk.length);
		return -3;
	}
	one_chunk.id = (one_chunk.data[0] << 24) + (one_chunk.data[1] << 16) + (one_chunk.data[2] << 8) + one_chunk.data[3];

	if (fread (buf, 1,4, f) != 4)
	{
		if (flag_Debug)
			printf ("    informational : failed to read chunk crc32\n");
		return -3;
	}
	one_chunk.crc32 = (buf[0] << 24) + (buf[1] << 16) + (buf[2] << 8) + buf[3];

	if (num_chunks >= max_chunks)
	{
		max_chunks += 8;
		if (pngChunks == NULL)
			pngChunks = (struct chunk_t *)malloc (max_chunks * sizeof(struct chunk_t));
		else
			pngChunks = (struct chunk_t *)realloc (pngChunks, max_chunks * sizeof(struct chunk_t));
	}
	pngChunks[num_chunks].id = one_chunk.id;
	pngChunks[num_chunks].length = one_chunk.length;
	pngChunks[num_chunks].data = one_chunk.data;
	pngChunks[num_chunks].crc32 = one_chunk.crc32;
	num_chunks++;

	return 0;
}

void reset_chunks (void)
{
	int i;

	for (i=0; i<num_chunks; i++)
	{
		if (pngChunks[i].length && pngChunks[i].data)
		{
			free (pngChunks[i].data);
			pngChunks[i].data = NULL;
		}
	}
	num_chunks = 0;
}

void demultiplyAlpha (int wide, int high, unsigned char *data)
{
	int x,y;
	unsigned char *srcPtr;

	srcPtr = data;

	for (y=0; y<high; y++)
	{
		/* skip rowfilter -- it's assumed to be 0 here anyway! */
		srcPtr++;
		for (x=0; x<4*wide; x+=4)
		{
			if (srcPtr[x+3])
			{
				srcPtr[x] = (srcPtr[x]*255+(srcPtr[x+3]>>1))/srcPtr[x+3];
				srcPtr[x+1] = (srcPtr[x+1]*255+(srcPtr[x+3]>>1))/srcPtr[x+3];
				srcPtr[x+2] = (srcPtr[x+2]*255+(srcPtr[x+3]>>1))/srcPtr[x+3];
			}
		}
		srcPtr += 4*wide;
	}
}

void removeRowFilters (int wide, int high, unsigned char *data)
{
	int x,y, rowfilter;
	unsigned char *srcPtr, *upPtr;

	srcPtr = data;

	for (y=0; y<high; y++)
	{
		rowfilter = *srcPtr;
		/*	Need to save original filter for re-applying! */
		/*	*srcPtr = 0; */
		srcPtr++;
		switch (rowfilter)
		{
			case 0:	// None
				break;
			case 1:	// Sub
				for (x=4; x<4*wide; x++)
				{
					srcPtr[x] += srcPtr[x-4];
				}
				break;
			case 2:	// Up
				upPtr = srcPtr - 4*wide - 1;
				if (y > 0)
				{
					for (x=0; x<4*wide; x++)
					{
						srcPtr[x] += upPtr[x];
					}
				}
				break;
			case 3:	// Average
				upPtr = srcPtr - 4*wide - 1;
				if (y == 0)
				{
					for (x=4; x<4*wide; x++)
					{
						srcPtr[x] += (srcPtr[x-4]>>1);
					}
				} else
				{
					srcPtr[0] += (upPtr[x]>>1);
					for (x=4; x<4*wide; x++)
					{
						srcPtr[x] += ((upPtr[x] + srcPtr[x-4])>>1);
					}
				}
				break;
			case 4:	// Paeth
				upPtr = srcPtr - 4*wide - 1;
				{
					int p,pa,pb,pc,value;
					int leftpix,toppix,topleftpix;

					for (x=0; x<4*wide; x++)
					{
						leftpix = 0;
						toppix = 0;
						topleftpix = 0;
						if (x > 0)
							leftpix = srcPtr[x-4];
						if (y > 0)
						{
							toppix = upPtr[x];
							if (x >= 4)
								topleftpix = upPtr[x-4];
						}
						p = leftpix + toppix - topleftpix;
						pa = p - leftpix; if (pa < 0) pa = -pa;
						pb = p - toppix; if (pb < 0) pb = -pb;
						pc = p - topleftpix; if (pc < 0) pc = -pc;
						if (pa <= pb && pa <= pc)
							value = leftpix;
						else if (pb <= pc)
							value = toppix;
						else
							value = topleftpix;

						srcPtr[x] += value;
					}
				}
				break;
			default:
				printf ("removerowfilter() : Unknown row filter %d\n", rowfilter);
		}
		srcPtr += 4*wide;
	}
}

void applyRowFilters (int wide, int high, unsigned char *data)
{
	int x,y, rowfilter;
	unsigned char *srcPtr, *upPtr;

	srcPtr = data;

	for (y=0; y<high; y++)
	{
		rowfilter = *srcPtr;
		srcPtr++;
		switch (rowfilter)
		{
			case 0:	// None
				break;
			case 1:	// Sub
				for (x=4*wide-1; x>=4; x--)
				{
					srcPtr[x] -= srcPtr[x-4];
				}
				break;
			case 2:	// Up
				if (y > 0)
				{
					upPtr = srcPtr - 1;
					for (x=4*wide-1; x>=0; x--)
					{
						srcPtr[x] -= upPtr[x];
					}
				}
				break;
			case 3:	// Average
				upPtr = srcPtr - 4*wide - 1;
				if (y == 0)
				{
					for (x=4*wide-1; x>=4; x--)
					{
						srcPtr[x] -= (srcPtr[x-4]>>1);
					}
				} else
				{
					srcPtr[0] -= (upPtr[x]>>1);
					for (x=4*wide-1; x>=4; x--)
					{
						srcPtr[x] -= ((upPtr[x] + srcPtr[x-4])>>1);
					}
				}
				break;
			case 4:	// Paeth
				upPtr = srcPtr - 1;
				{
					int p,pa,pb,pc,value;
					int leftpix,toppix,topleftpix;

					for (x=4*wide-1; x>=0; x--)
					{
						leftpix = 0;
						toppix = 0;
						topleftpix = 0;
						if (x > 0)
							leftpix = srcPtr[x-4];
						if (y > 0)
						{
							toppix = upPtr[x];
							if (x >= 4)
								topleftpix = upPtr[x-4];
						}
						p = leftpix + toppix - topleftpix;
						pa = p - leftpix; if (pa < 0) pa = -pa;
						pb = p - toppix; if (pb < 0) pb = -pb;
						pc = p - topleftpix; if (pc < 0) pc = -pc;
						if (pa <= pb && pa <= pc)
							value = leftpix;
						else if (pb <= pc)
							value = toppix;
						else
							value = topleftpix;

						srcPtr[x] -= value;
					}
				}
				break;
			default:
				printf ("applyrowfilter : Unknown row filter %d\n", rowfilter);
		}
		srcPtr += 4*wide;
	}
}

int process (char *filename)
{
	FILE *f;
	unsigned int length;
	int i;
	unsigned char buf[16];

/* This is what we're looking for */
	int isPhoney = 0;

/* Standard IHDR items: */
	unsigned int imgwidth, imgheight, bitdepth,colortype, compression, filter, interlace;
/* Derived IHRD items: */
	unsigned int bitspp;
	unsigned int bytespp;
	unsigned int bytespline;

	struct chunk_t *ihdr_chunk = NULL;
	int idat_first_index = 0;
	unsigned char *all_idat = NULL;
	unsigned int total_idat_size = 0;

/* Adam7 interlacing information */
	int Starting_Row [] =  { 0, 0, 4, 0, 2, 0, 1 };
	int Starting_Col [] =  { 0, 4, 0, 2, 0, 1, 0 };
	int Row_Increment [] = { 8, 8, 8, 4, 4, 2, 2 };
	int Col_Increment [] = { 8, 8, 4, 4, 2, 2, 1 };
	int row_filter_bytes = 0;

/* Needed for unpacking/repacking */
	unsigned char *data_out;
	int out_length;
	unsigned char *data_repack = NULL;
	int repack_size, repack_length;

/* New file name comes here */
	char *write_file_name = NULL;
	FILE *write_file;
	int write_block_size;

/*	int i,j,b;
	int blocklength, blockid;
	unsigned int filterbytes;
	int isInterlaced = 0; */

	int didShowName = 0;

	int crc, result;

	f = fopen (filename, "rb");
	if (!f)
	{
		printf ("%s : not found or could not be opened\n", filename);
		return 0;
	}

	fseek (f, 0, SEEK_END);
	length = ftell (f);
	fseek (f, 0, SEEK_SET);

	i = 0;

	fread (buf,1,8, f); i += 8;
	if (memcmp (buf, png_magic_bytes, 8))
	{
		printf ("%s : not a PNG file\n", filename);
		fclose (f);
		return 0;
	}
	result = init_chunk (f, length);
	if (result < 0)
	{
		fclose (f);
		switch (result)
		{
			case -1: printf ("%s : invalid chunk size\n", filename); break;
			case -2: printf ("%s : out of memory\n", filename); break;
			case -3: printf ("%s : premature end of file\n", filename); break;
		}
		reset_chunks ();
		return 0;
	}

	isPhoney = 1;
	if (pngChunks[0].id != 0x43674249)	/* "CgBI" */
	{
		isPhoney = 0;
		printf ("%s : not an -iphone crushed PNG file\n", filename);
		if (!flag_Process_Anyway)
		{
			fclose (f);
			reset_chunks ();
			return 0;
		}
		didShowName = 1;
	}

	do
	{
		result = init_chunk (f, length);
		if (result < 0)
		{
			fclose (f);

			if (didShowName)
				printf ("    ");
			else
			{
				didShowName = 1;
				printf ("%s : ", filename);
			}
			switch (result)
			{
				case -1: printf ("invalid chunk size\n"); break;
				case -2: printf ("out of memory\n"); break;
				case -3: printf ("premature end of file\n"); break;
				default: printf ("error code %d\n", result);
			}
			reset_chunks ();
			return 0;
		}
		if (num_chunks > 0 && pngChunks[num_chunks-1].id == 0x49454E44)	/* "IEND" */
			break;
	} while (!feof(f));

	if (pngChunks[num_chunks-1].id != 0x49454E44)	/* "IEND" */
	{
		fclose (f);

		if (didShowName)
			printf ("    ");
		else
		{
			didShowName = 1;
			printf ("%s : ", filename);
		}
		printf ("missing IEND chunk\n");
		reset_chunks ();
		return 0;
	}

	if (fgetc (f) != EOF)
	{
		if (didShowName)
			printf ("    ");
		else
		{
			didShowName = 1;
			printf ("%s : ", filename);
		}
		printf ("Extra data after IEND, very suspicious! Excluded from conversion\n");
	}
	fclose (f);

	if (flag_List_Chunks)
	{
		for (i=0; i<num_chunks; i++)
		{
			if (!didShowName)
			{
				didShowName = 1;
				printf ("%s :\n", filename);
			}
			printf ("    chunk : %c%c%c%c  length %6u  CRC32 %08X", (pngChunks[i].id >> 24) & 0xff,(pngChunks[i].id >> 16) & 0xff, (pngChunks[i].id >> 8) & 0xff,pngChunks[i].id & 0xff, pngChunks[i].length, pngChunks[i].crc32);
			crc = crc32s (pngChunks[i].data, pngChunks[i].length+4);
			if (pngChunks[i].crc32 != crc)
				printf (" --> CRC32 check invalid! Should be %08X", crc);
			printf ("\n");
		}
	} else
	{
		for (i=0; i<num_chunks; i++)
		{
			crc = crc32s (pngChunks[i].data, pngChunks[i].length+4);
			if (pngChunks[i].crc32 != crc)
			{
				if (!didShowName)
				{
					didShowName = 1;
					printf ("%s :\n", filename);
				}
				printf ("    chunk : %c%c%c%c  length %6u  CRC32 %08X", (pngChunks[i].id >> 24) & 0xff,(pngChunks[i].id >> 16) & 0xff, (pngChunks[i].id >> 8) & 0xff,pngChunks[i].id & 0xff, pngChunks[i].length, pngChunks[i].crc32);
				printf (" -> invalid, changed to %08X\n", crc);
				pngChunks[i].crc32 = crc;
			}
		}
	}

	if (pngChunks[0].id == 0x43674249)	/* "CgBI" */
	{
		if (num_chunks > 0 && pngChunks[1].id == 0x49484452)	/* "IHDR" */
			ihdr_chunk = &pngChunks[1];
	} else
	{
		if (pngChunks[0].id == 0x49484452)	/* "IHDR" */
			ihdr_chunk = &pngChunks[0];
	}

	if (ihdr_chunk == NULL)
	{
		if (didShowName)
			printf ("    ");
		else
		{
			didShowName = 1;
			printf ("%s : ", filename);
		}
		printf ("no IHDR chunk found\n");
		reset_chunks ();
		return 0;
	}
	if (ihdr_chunk->length != 13)
	{
		if (didShowName)
			printf ("    ");
		else
		{
			didShowName = 1;
			printf ("%s : ", filename);
		}
		printf ("IHDR chunk length incorrect\n");
		reset_chunks ();
		return 0;
	}
	imgwidth = read_long (&ihdr_chunk->data[4]);
	imgheight = read_long (&ihdr_chunk->data[8]);
	bitdepth = ihdr_chunk->data[12];
	colortype = ihdr_chunk->data[13];
	compression = ihdr_chunk->data[14];
	filter = ihdr_chunk->data[15];
	interlace = ihdr_chunk->data[16];

	if (imgwidth == 0 || imgheight == 0 || imgwidth > 2147483647 || imgheight > 2147483647)
	{
		if (didShowName)
			printf ("    ");
		else
		{
			didShowName = 1;
			printf ("%s : ", filename);
		}
		printf ("image dimensions invalid\n");
		reset_chunks ();
		return 0;
	}
	if (compression != 0)
	{
		if (didShowName)
			printf ("    ");
		else
		{
			didShowName = 1;
			printf ("%s : ", filename);
		}
		printf ("unknown compression type %d\n", compression);
		reset_chunks ();
		return 0;
	}
	if (filter != 0)
	{
		if (didShowName)
			printf ("    ");
		else
		{
			didShowName = 1;
			printf ("%s : ", filename);
		}
		printf ("unknown filter type %d\n", filter);
		reset_chunks ();
		return 0;
	}
	if (interlace != 0 && interlace != 1)
	{
		if (didShowName)
			printf ("    ");
		else
		{
			didShowName = 1;
			printf ("%s : ", filename);
		}
		printf ("unknown interlace type %d\n", interlace);
		reset_chunks ();
		return 0;
	}

/***  From PNG Specs, http://www.w3.org/TR/PNG-Chunks.html
   Color    Allowed    Interpretation
   Type    Bit Depths
   ------  ----------  ----------------------------------
   0       1,2,4,8,16  Each pixel is a grayscale sample.

   2       8,16        Each pixel is an R,G,B triple.

   3       1,2,4,8     Each pixel is a palette index;
                       a PLTE chunk must appear.

   4       8,16        Each pixel is a grayscale sample,
                       followed by an alpha sample.

   6       8,16        Each pixel is an R,G,B triple,
                       followed by an alpha sample.
***/

	i = 0;

	switch (colortype)
	{
		case 0:
			if (bitdepth == 1 ||
				bitdepth == 2 ||
				bitdepth == 4 ||
				bitdepth == 8 ||
				bitdepth == 16)
				i = 1;
				bitspp = bitdepth;
			break;
		case 2:
			if (bitdepth == 8 ||
				bitdepth == 16)
				i = 1;
			bitspp = 3*bitdepth;
			break;
		case 3:
			if (bitdepth == 1 ||
				bitdepth == 2 ||
				bitdepth == 4 ||
				bitdepth == 8)
				i = 1;
			bitspp = bitdepth;
			break;
		case 4:
			if (bitdepth == 8 ||
				bitdepth == 16)
				i = 1;
			bitspp = 2*bitdepth;
			break;
		case 6:
			if (bitdepth == 8 ||
				bitdepth == 16)
				i = 1;
			bitspp = 4*bitdepth;
			break;
		default:
			if (didShowName)
				printf ("    ");
			else
			{
				didShowName = 1;
				printf ("%s : ", filename);
			}
			printf ("unknown color type %d\n", colortype);
			reset_chunks ();
			return 0;
	}
	if (!i)
	{
		if (didShowName)
			printf ("    ");
		else
		{
			didShowName = 1;
			printf ("%s : ", filename);
		}
		printf ("invalid bit depth %d for color type %d\n", bitdepth, colortype);
		reset_chunks ();
		return 0;
	}

	bytespline = (imgwidth*bitspp+7)/8;
 /*	Warning!
 	This value is only valid for 8/16 bit images! */
	bytespp = (bitspp+7)/8;

	if (flag_Verbose)
	{
		if (!didShowName)
		{
			didShowName = 1;
			printf ("%s :\n", filename);
		}
		printf ("    image width        : %u\n", imgwidth);
		printf ("    image height       : %u\n", imgheight);
		printf ("    bit depth          : %u\n", bitdepth);
		printf ("    color type         : %u\n", colortype);
		printf ("    compression        : %u\n", compression);
		printf ("    filter             : %u\n", filter);
		printf ("    interlace          : %u\n", interlace);
		printf ("    bits per pixel     : %d\n", bitspp);
		printf ("    bytes per line     : %d\n", bytespline);
	}

	row_filter_bytes = imgheight;
	if (interlace == 1)
	{
		int w,h,pass;

		if (flag_Verbose)
			printf ("    Adam7 interlacing:\n");

		row_filter_bytes = 0;
		for (pass=0; pass<7; pass++)
		{
			/* Formula taken from pngcheck ! */
			w = (imgwidth - Starting_Col[pass] + Col_Increment[pass] - 1)/Col_Increment[pass];
			h = (imgheight - Starting_Row[pass] + Row_Increment[pass] - 1)/Row_Increment[pass];
			if (flag_Verbose)
				printf ("      pass %d: %d x %d\n", pass, w, h);
			row_filter_bytes += h;
		}
	}
	if (flag_Verbose)
	{
		printf ("    row filter bytes   : %u\n", row_filter_bytes);
		printf ("    expected data size : %u bytes\n", bytespline * imgheight + row_filter_bytes);
	}

	for (i=0; i<num_chunks; i++)
	{
		if (pngChunks[i].id == 0x49444154)	/* "IDAT" */
		{
			idat_first_index = i;
			break;
		}
	}
	if (i == num_chunks)
	{
		if (didShowName)
			printf ("    ");
		else
		{
			didShowName = 1;
			printf ("%s : ", filename);
		}
		printf ("no IDAT chunks found\n");
		reset_chunks ();
		return 0;
	}
/** Test for consecutive IDAT chunks */
	/* continue where we left off */
	while (i < num_chunks)
	{
		if (pngChunks[i].id != 0x49444154)	/* "IDAT" */
			break;
		total_idat_size += pngChunks[i].length;
		i++;
	}
	/* test the remaining chunks */
	while (i < num_chunks)
	{
		if (pngChunks[i].id == 0x49444154)	/* "IDAT" */
			break;
		i++;
	}
	if (i != num_chunks)
	{
		if (didShowName)
			printf ("    ");
		else
		{
			didShowName = 1;
			printf ("%s : ", filename);
		}
		printf ("IDAT chunks are not consecutive\n");
		reset_chunks ();
		return 0;
	}

	if (total_idat_size == 0)
	{
		if (didShowName)
			printf ("    ");
		else
		{
			didShowName = 1;
			printf ("%s : ", filename);
		}
		printf ("all IDAT chunks are empty\n");
		reset_chunks ();
		return 0;
	}

/*	Only need to re-write the image data for -phone 8 bit RGB and RGBA images */
/*	Note To Self: Is that true? What about 16 bit images? What about palette images? */
/*	Okay -- checked the above, it appears these two do NOT get fried. */

/*	Swap BGR to RGB, BGRA to RGBA */
	if (bitdepth == 8 &&
		(colortype == 2 ||		/* Each pixel is an R,G,B triple (8 or 16 bits) */
		colortype == 6))		/* Each pixel is an R,G,B triple, followed by an alpha sample (8 or 16 bits) */
	{
		if (isPhoney && flag_Verbose)
			printf ("    swapping BGR(A) to RGB(A)\n");

	/*** Gather all IDATs into one ***/
		if (flag_Debug)
			printf ("    informational : total idat size: %u\n", total_idat_size);
		all_idat = (unsigned char *)malloc (total_idat_size);
		if (all_idat == NULL)
		{
			if (didShowName)
				printf ("    ");
			else
			{
				didShowName = 1;
				printf ("%s : ", filename);
			}
			printf ("out of memory\n");
			reset_chunks ();
			return 0;
		}
		i = idat_first_index;
		total_idat_size = 0;
		while (i < num_chunks && pngChunks[i].id == 0x49444154)	/* "IDAT" */
		{
			memcpy (all_idat+total_idat_size, pngChunks[i].data+4, pngChunks[i].length);
			total_idat_size += pngChunks[i].length;
			i++;
		}

	/*** So far everything appears to check out. Let's try uncompressing the IDAT chunks. ***/
		data_out = (unsigned char *)malloc (bytespline * imgheight + row_filter_bytes);
		if (data_out == NULL)
		{
			free (all_idat);
			if (didShowName)
				printf ("    ");
			else
			{
				didShowName = 1;
				printf ("%s : ", filename);
			}
			printf ("out of memory\n");
			reset_chunks ();
			return 0;
		}

		if (isPhoney)
			out_length = tinfl_decompress_mem_to_mem(data_out, bytespline * imgheight + row_filter_bytes, all_idat, total_idat_size, 0);
		else
			out_length = tinfl_decompress_mem_to_mem(data_out, bytespline * imgheight + row_filter_bytes, all_idat, total_idat_size, TINFL_FLAG_PARSE_ZLIB_HEADER);

		free (all_idat);
		all_idat = NULL;

		if (out_length <= 0)
		{
			free (data_out);
			if (didShowName)
				printf ("    ");
			else
			{
				didShowName = 1;
				printf ("%s : ", filename);
			}
			printf ("unspecified decompression error\n");
			reset_chunks ();
			return 0;
		}

		if (out_length != imgheight*bytespline + row_filter_bytes)
		{
			if (didShowName)
				printf ("    ");
			else
			{
				didShowName = 1;
				printf ("%s : ", filename);
			}
			printf ("decompression error, expected %u but got %u bytes\n", imgheight*bytespline + row_filter_bytes, out_length);
			free (data_out);
			reset_chunks ();
			return 0;
		}
		if (flag_Verbose)
			printf ("    uncompressed size  : %u bytes\n", bytespline * imgheight + row_filter_bytes);

		if (isPhoney || flag_Process_Anyway)
		{
			if (interlace == 1)		/* needs Adam7 unpacking! */
			{
				int x,y, b, row;
				int pass, w,h;
				int startat;

			/*	check if all row filters are okay */
				y = 0;
				for (pass=0; pass<7; pass++)
				{
					w = (imgwidth - Starting_Col[pass] + Col_Increment[pass] - 1)/Col_Increment[pass];
					h = (imgheight - Starting_Row[pass] + Row_Increment[pass] - 1)/Row_Increment[pass];
					row=0;
					while (row < h)
					{
						if (data_out[y] > 4)
						{
							free (data_out);
							if (didShowName)
								printf ("    ");
							else
							{
								didShowName = 1;
								printf ("%s : ", filename);
							}
							printf ("unknown row filter type (%d)\n", data_out[y]);
							reset_chunks ();
							return 0;
						}
						/* skip row filter byte */
						y++;
						/* skip rest of row */
						y += w * bytespp;
						row++;
					}
				}


				y = 0;
				for (pass=0; pass<7; pass++)
				{
					/* Formula taken from pngcheck ! */
					w = (imgwidth - Starting_Col[pass] + Col_Increment[pass] - 1)/Col_Increment[pass];
					h = (imgheight - Starting_Row[pass] + Row_Increment[pass] - 1)/Row_Increment[pass];
					startat = y;
					row=0;
					while (row < h)
					{
						/* skip row filter byte */
						y++;
						/* swap all bytes in this row */
						x = 0;
						while (x < w)
						{
							b = data_out[y+2];
							data_out[y+2] = data_out[y];
							data_out[y] = b;
							y += bytespp;
							x++;
						}
						row++;
					}
					if (isPhoney && flag_UpdateAlpha && colortype == 6)	// RGBA
					{
						removeRowFilters (w, h, data_out+startat);
						demultiplyAlpha (w, h, data_out+startat);
						applyRowFilters (w, h, data_out+startat);
					}
				}
			} else
			{
				int x,y, b;

				/* check row filters */
				y = 0;
				while (y < bytespline * imgheight + row_filter_bytes)
				{
					if (data_out[y] > 4)
					{
						free (data_out);
						if (didShowName)
							printf ("    ");
						else
						{
							didShowName = 1;
							printf ("%s : ", filename);
						}
						printf ("unknown row filter type (%d)\n", data_out[y]);
						reset_chunks ();
						return 0;
					}
					/* skip row filter byte */
					y++;
					/* skip entire row */
					y += bytespline;
				}

				y = 0;
				while (y < bytespline * imgheight + row_filter_bytes)
				{
					/* skip row filter byte */
					y++;
					/* swap all bytes in this row */
					x = 0;
					while (x < imgwidth)
					{
						b = data_out[y+2];
						data_out[y+2] = data_out[y];
						data_out[y] = b;
						y += bytespp;
						x++;
					}
				}
				if (isPhoney && flag_UpdateAlpha && colortype == 6)	// RGBA
				{
					removeRowFilters (imgwidth, imgheight, data_out);
					demultiplyAlpha (imgwidth, imgheight, data_out);
					applyRowFilters (imgwidth, imgheight, data_out);
				}
			}
		}

	/*	Force VERY conservative repacking size ... */
		repack_size = 2*(bytespline * imgheight + row_filter_bytes);
		data_repack = (unsigned char *)malloc (repack_size);
		if (data_repack == NULL)
		{
			free (data_out);
			if (didShowName)
				printf ("    ");
			else
			{
				didShowName = 1;
				printf ("%s : ", filename);
			}
			printf ("out of memory\n");
			reset_chunks ();
			return 0;
		}

		/* ouch -- reserve 4 bytes at the start to put "IDAT" in! */
		/* yeah well, it beats having to re-allocate each block on writing ... */
		repack_length = tdefl_compress_mem_to_mem(data_repack+4, repack_size-4, data_out, out_length, TDEFL_WRITE_ZLIB_HEADER);
		if (repack_length == 0)
		{
			free (data_out);
			free (data_repack);
			if (didShowName)
				printf ("    ");
			else
			{
				didShowName = 1;
				printf ("%s : ", filename);
			}
			printf ("unspecified compression error\n");
			reset_chunks ();
			return 0;
		}

		if (flag_Verbose)
			printf ("    repacked size: %u bytes\n", repack_length);

		free (data_out);
	}

	if (flag_Rewrite)
	{
		if (outputPath && outputPath[0])
		{
			char *clipOffPath;
			clipOffPath = strrchr (filename, '/');
			if (clipOffPath)
				clipOffPath++;
			else
				clipOffPath = filename;

			if (suffix && suffix[0])
				write_file_name = (char *)malloc (strlen(outputPath)+strlen(clipOffPath)+strlen(suffix)+8);
			else
				write_file_name = (char *)malloc (strlen(outputPath)+strlen(clipOffPath)+8);
			if (write_file_name == NULL)
			{
				if (didShowName)
					printf ("    ");
				else
				{
					didShowName = 1;
					printf ("%s : ", filename);
				}
				printf ("failed to allocate memory for output file name ...\n");
				reset_chunks ();
				return 0;
			}
			strcpy (write_file_name, outputPath);
			strcat (write_file_name, "/");
			strcat (write_file_name, clipOffPath);
		} else
		{
			write_file_name = (char *)malloc (strlen(filename)+strlen(suffix)+8);
			if (write_file_name == NULL)
			{
				if (didShowName)
					printf ("    ");
				else
				{
					didShowName = 1;
					printf ("%s : ", filename);
				}
				printf ("failed to allocate memory for output file name ...\n");
				reset_chunks ();
				return 0;
			}
			strcpy (write_file_name, filename);
		}
		if (suffix && suffix[0])
		{
			if (!strcasecmp (write_file_name+strlen(write_file_name)-4, ".png"))
				strcpy (write_file_name+strlen(write_file_name)-4, suffix);
			else
				strcat (write_file_name, suffix);
			strcat (write_file_name, ".png");
		}

		if (!didShowName)
		{
			printf ("%s : ", filename);
		}
		printf ("writing to file %s\n", write_file_name);

		write_file = fopen (write_file_name, "wb");
		if (!write_file)
		{
			printf ("    failed to create output file!\n");
			reset_chunks ();
			return 0;
		}

		fwrite (png_magic_bytes, 1, 8, write_file);

		i = 0;
		/* need to skip first bogus chunk */
		/* at this point, I expect the first one to be IHDR! */
		if (pngChunks[0].id == 0x43674249)	/* "CgBI" */
			i++;
		while (i < num_chunks && pngChunks[i].id != 0x49444154)	/* "IDAT" */
		{
			fputc ( (pngChunks[i].length >> 24) & 0xff, write_file);
			fputc ( (pngChunks[i].length >> 16) & 0xff, write_file);
			fputc ( (pngChunks[i].length >>  8) & 0xff, write_file);
			fputc ( (pngChunks[i].length      ) & 0xff, write_file);
			fwrite (pngChunks[i].data, pngChunks[i].length+4, 1, write_file);
			fputc ( (pngChunks[i].crc32 >> 24) & 0xff, write_file);
			fputc ( (pngChunks[i].crc32 >> 16) & 0xff, write_file);
			fputc ( (pngChunks[i].crc32 >>  8) & 0xff, write_file);
			fputc ( (pngChunks[i].crc32      ) & 0xff, write_file);
			i++;
		}

	/* Did we repack the data, or do we just need to rewrite the file? */
		if (data_repack)
		{
			write_block_size = 0;
			while (write_block_size < repack_length)
			{
				data_repack[4+write_block_size-4] = 'I';
				data_repack[4+write_block_size-3] = 'D';
				data_repack[4+write_block_size-2] = 'A';
				data_repack[4+write_block_size-1] = 'T';
				if (repack_length-write_block_size > repack_IDAT_size)
				{
					fputc ( (repack_IDAT_size >> 24) & 0xff, write_file);
					fputc ( (repack_IDAT_size >> 16) & 0xff, write_file);
					fputc ( (repack_IDAT_size >>  8) & 0xff, write_file);
					fputc ( (repack_IDAT_size      ) & 0xff, write_file);
					fwrite ( data_repack+write_block_size, repack_IDAT_size+4,1, write_file);
					crc = crc32s (data_repack+write_block_size, repack_IDAT_size+4);
					fputc ( (crc >> 24) & 0xff, write_file);
					fputc ( (crc >> 16) & 0xff, write_file);
					fputc ( (crc >>  8) & 0xff, write_file);
					fputc ( (crc      ) & 0xff, write_file);
					write_block_size += repack_IDAT_size;
				} else
				{
					fputc ( ((repack_length-write_block_size) >> 24) & 0xff, write_file);
					fputc ( ((repack_length-write_block_size) >> 16) & 0xff, write_file);
					fputc ( ((repack_length-write_block_size) >>  8) & 0xff, write_file);
					fputc ( ((repack_length-write_block_size)      ) & 0xff, write_file);
					fwrite ( data_repack+write_block_size, (repack_length-write_block_size)+4,1, write_file);
					crc = crc32s (data_repack+write_block_size, (repack_length-write_block_size)+4);
					fputc ( (crc >> 24) & 0xff, write_file);
					fputc ( (crc >> 16) & 0xff, write_file);
					fputc ( (crc >>  8) & 0xff, write_file);
					fputc ( (crc      ) & 0xff, write_file);
					write_block_size = repack_length;
				}
			}

			/* skip original IDAT chunks */
			while (i < num_chunks && pngChunks[i].id == 0x49444154)	/* "IDAT" */
				i++;

			free (data_repack);
		} else
		{
			/* image was not repacked */
			/* output original IDAT chunks */
			while (i < num_chunks && pngChunks[i].id == 0x49444154)	/* "IDAT" */
			{
				fputc ( (pngChunks[i].length >> 24) & 0xff, write_file);
				fputc ( (pngChunks[i].length >> 16) & 0xff, write_file);
				fputc ( (pngChunks[i].length >>  8) & 0xff, write_file);
				fputc ( (pngChunks[i].length      ) & 0xff, write_file);
				fwrite (pngChunks[i].data, pngChunks[i].length+4, 1, write_file);
				fputc ( (pngChunks[i].crc32 >> 24) & 0xff, write_file);
				fputc ( (pngChunks[i].crc32 >> 16) & 0xff, write_file);
				fputc ( (pngChunks[i].crc32 >>  8) & 0xff, write_file);
				fputc ( (pngChunks[i].crc32      ) & 0xff, write_file);
				i++;
			}
		}

		/* output remaining chunks */
		while (i < num_chunks)
		{
			fputc ( (pngChunks[i].length >> 24) & 0xff, write_file);
			fputc ( (pngChunks[i].length >> 16) & 0xff, write_file);
			fputc ( (pngChunks[i].length >>  8) & 0xff, write_file);
			fputc ( (pngChunks[i].length      ) & 0xff, write_file);
			fwrite (pngChunks[i].data, pngChunks[i].length+4, 1, write_file);
			fputc ( (pngChunks[i].crc32 >> 24) & 0xff, write_file);
			fputc ( (pngChunks[i].crc32 >> 16) & 0xff, write_file);
			fputc ( (pngChunks[i].crc32 >>  8) & 0xff, write_file);
			fputc ( (pngChunks[i].crc32      ) & 0xff, write_file);
			i++;
		}
		fclose (write_file);
		free (write_file_name);
		reset_chunks ();

		return 1;
	}

/* We come here if nothing was written */
/* Just show the name and go away */
	if (!didShowName)
	{
		printf ("%s\n", filename);
	}

	if (data_repack)
		free (data_repack);

	reset_chunks ();
	return 0;
}

int main (int argc, char **argv)
{
	int i, nomoreoptions;
	int seenFiles = 0, processedFiles = 0;

	if (argc == 1)
	{
		printf ("PNGdefry version 1.1 by [Jongware], 21-Jan-2012\n");
		printf ("\n");
		printf ("Removes -iphone specific data chunk, reverses colors from BGRA to RGBA, and de-multiplies alpha\n");
		printf ("\n");
		printf ("usage: pngdefry [-soaplvid] file.png [...]\n");
		printf ("\n");
		printf ("Options:\n");
		printf ("  -          use this if your first input file starts with an '-'\n");
		printf ("  -s(suffix) append suffix to output file name\n");
		printf ("  -o(path)   write output file(s) to path\n");
		printf ("             Note: without -s or -o, NO output will be created.\n");
		printf ("  -a         do NOT de-multiply alpha\n");
		printf ("  -l         list all chunks\n");
		printf ("  -v         verbose processing\n");
		printf ("  -i(value)  max IDAT chunk size in bytes (minimum: 1024; default: %u)\n", repack_IDAT_size);
		printf ("  -p         process all files, not just -iphone ones (for debugging purposed only)\n");
		printf ("  -d         very verbose processing (for debugging purposes only)\n");
		return 0;
	}

	nomoreoptions = 0;
	for (i=1; i<argc; i++)
	{
		if (argv[i][0] != '-')
			break;
		switch (argv[i][1])
		{
			case 0:
				nomoreoptions = 1;
				break;
			case 'd': flag_Debug = 1; flag_Verbose = 1; flag_List_Chunks = 1; break;
			case 'a': flag_UpdateAlpha = 0; break;
			case 'l': flag_List_Chunks = 1; break;
			case 'p': flag_Process_Anyway = 1; break;
			case 'v': flag_Verbose = 1; break;
			case 's':
				if (argv[i][2])
				{
					suffix = (char *)malloc(strlen(argv[i])+2);
					if (suffix == NULL)
					{
						printf ("pngdefry : unexpected memory allocation error on line %d\n", __LINE__);
						return -1;
					}
					strcpy (suffix, argv[i]+2);
				} else
				{
					if (i < argc-1)
					{
						i++;
						suffix = (char *)malloc(strlen(argv[i])+2);
						if (suffix == NULL)
						{
							printf ("pngdefry : unexpected memory allocation error on line %d\n", __LINE__);
							return -1;
						}
						strcpy (suffix, argv[i]);
					} else
					{
						printf ("pngdefry : -s is missing suffix\n");
						return -1;
					}
				}
				argv[i][2] = 0;
				flag_Rewrite = 1;
				break;
			case 'o':
				if (argv[i][2])
				{
					outputPath = (char *)malloc(strlen(argv[i])+2);
					if (outputPath == NULL)
					{
						printf ("pngdefry : unexpected memory allocation error on line %d\n", __LINE__);
						return -1;
					}
					strcpy (outputPath, argv[i]+2);
				} else
				{
					if (i < argc-1)
					{
						i++;
						outputPath = (char *)malloc(strlen(argv[i])+2);
						if (outputPath == NULL)
						{
							printf ("pngdefry : unexpected memory allocation error on line %d\n", __LINE__);
							return -1;
						}
						strcpy (outputPath, argv[i]);
					} else
					{
						printf ("pngdefry : -o is missing output path\n");
						return -1;
					}
				}
				argv[i][2] = 0;
				flag_Rewrite = 1;
				break;
			case 'i':
				if (argv[i][2])
				{
					char *endptr;
					repack_IDAT_size = strtol(argv[i]+2, &endptr, 10);
					if (*endptr || repack_IDAT_size < 1024)
					{
						printf ("pngdefry : invalid repack size '%s'\n", argv[i]+2);
						return -1;
					}
					/* yuck. it does circumvent problems down later, thouh, and an extra flag to set/check :( */
					argv[i][2] = 0;
					break;
				} else
				{
					if (i < argc-1)
					{
						char *endptr;
						i++;
						repack_IDAT_size = strtol(argv[i], &endptr, 10);
						if (*endptr || repack_IDAT_size < 1024)
						{
							printf ("pngdefry : invalid repack size '%s'\n", argv[i]);
							return -1;
						}
						/* yuck. it does circumvent problems down later, thouh, and an extra flag to set/check :( */
						argv[i][2] = 0;
					} else
					{
						printf ("pngdefry : -i is missing repack size\n");
						return -1;
					}
				}
				break;
			default:
				printf ("pngdefry : unknown option '%s'\n", argv[i]);
				return -1;
		}

		/* was the last option seen '-' ? */
		if (nomoreoptions)
		{
			i++;
			break;
		}

		if (argv[i][2] != 0)
		{
			printf ("pngdefry : unknown option '%s'\n", argv[i]);
			return -1;
		}
	}
	if (i == argc)
	{
		printf ("pngdefry : no file name(s) provided\n");
		return -1;
	}
/*	if (flag_Rewrite == 0)
		printf ("pngdefry : no -s(suffix) or -o(path) provided, files will be processed but not written\n"); */

	for (; i<argc; i++)
	{
		seenFiles++;
		if (process (argv[i]))
			processedFiles++;
	}
	if (flag_Rewrite)
		printf ("pngdefry : seen %d file(s), wrote %d file(s)\n", seenFiles, processedFiles);
	else
		printf ("pngdefry : seen %d file(s), processed %d file(s)\n", seenFiles, processedFiles);
	return 0;
}


/*
  This is free and unencumbered software released into the public domain.

  Anyone is free to copy, modify, publish, use, compile, sell, or
  distribute this software, either in source code form or as a compiled
  binary, for any purpose, commercial or non-commercial, and by any
  means.

  In jurisdictions that recognize copyright laws, the author or authors
  of this software dedicate any and all copyright interest in the
  software to the public domain. We make this dedication for the benefit
  of the public at large and to the detriment of our heirs and
  successors. We intend this dedication to be an overt act of
  relinquishment in perpetuity of all present and future rights to this
  software under copyright law.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
  IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
  OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
  ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
  OTHER DEALINGS IN THE SOFTWARE.

  For more information, please refer to <http://unlicense.org/>
*/
