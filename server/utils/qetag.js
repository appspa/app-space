// 计算文件的eTag，参数为buffer或者readableStream或者文件路径
function getEtag(buffer,callback){

	// 判断传入的参数是buffer还是stream还是filepath
	let mode = 'buffer';

	if(typeof buffer === 'string'){
		buffer = require('fs').createReadStream(buffer);
		mode='stream';
	}else if(buffer instanceof require('stream')){
		mode='stream';
	}

	// sha1算法
	let sha1 = function(content){
		let crypto = require('crypto');
		let sha1 = crypto.createHash('md5');
		sha1.update(content);
		return sha1.digest('hex');
	};

	// 以4M为单位分割
	let blockSize = 4*1024*1024;
	let sha1String = [];
	let prefix = 0x16;
	let blockCount = 0;

	switch(mode){
		case 'buffer':
			let bufferSize = buffer.length;
			blockCount = Math.ceil(bufferSize / blockSize);

			for(let i=0;i<blockCount;i++){
				sha1String.push(sha1(buffer.slice(i*blockSize,(i+1)*blockSize)));
			}
			process.nextTick(function(){
				callback(calcEtag());
			});
			break;
		case 'stream':
			let stream = buffer;
			stream.on('readable', function() {
				var chunk;
				while (chunk = stream.read(blockSize)) {
					sha1String.push(sha1(chunk));
					blockCount++;
				}
			});
			stream.on('end',function(){
				callback(calcEtag());
			});
			break;
	}

	function calcEtag(){
		if(!sha1String.length){
			return 'Fto5o-5ea0sNMlW_75VgGJCv2AcJ';
		}
		let sha1Buffer = Buffer.concat(sha1String,blockCount * 20);

		// 如果大于4M，则对各个块的sha1结果再次sha1
		if(blockCount > 1){
			prefix = 0x96;
			sha1Buffer = sha1(sha1Buffer);
		}

		sha1Buffer = Buffer.concat(
			[new Buffer([prefix]),sha1Buffer],
			sha1Buffer.length + 1
		);

		return sha1Buffer.toString('base64')
			.replace(/\//g,'_').replace(/\+/g,'-');

	}

}

module.exports = getEtag;
