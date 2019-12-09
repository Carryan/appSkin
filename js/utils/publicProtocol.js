//设置头像，如果有，用本身的，没有给默认值
var setImg = function(imgURL, imgFlag) {
	var tempUrl = '';
	if (imgURL == null || imgURL.length == 0) {
		if (imgFlag == 1) { //订购默认图
			tempUrl = '../../img/order.png';
		} else {
			tempUrl = '../../img/utils/noImgPerson.jpg';
		}
	} else {
		var myDate = new Date();
		tempUrl = imgURL + '?' + myDate.getTime();
	}
	//	console.log('tempUrl000:'+tempUrl);
	return tempUrl;
}

//将时间转换为显示的格式
var modifyTimeFormat = function(str) {
	var tempStr = '';
	var dt_now = new Date();
	var int_year = dt_now.getYear();
	var dt_item = new Date(str.replace(/-/g, '/'));
	if (int_year == dt_item.getYear()) {
		tempStr = events.format(dt_item, "MM-dd hh:mm")
	} else {
		tempStr = events.format(dt_item, "yyyy-MM-dd hh:mm")
	}
	return tempStr;
}


//判断当前选择时间是否小于是当前实际时间
var contrastTime = function (selctTime) {
	selctTime = selctTime.replace(/-/g,'');
	selctTime = selctTime.replace(/ /g,'');
	selctTime = selctTime.replace(/:/g,'');
	var d = new Date();
	var tempS = events.format(d, "yyyy-MM-dd hh:mm");
	tempS = tempS.replace(/-/g,'');
	tempS = tempS.replace(/ /g,'');
	tempS = tempS.replace(/:/g,'');
	if (parseFloat(tempS)<parseFloat(selctTime)) {
		return 0;
	}
	return 1;
}

//url,
//encryData,需要加密的字段
//commonData,不需要加密的对象
//flag,0表示不需要合并共用数据，1为添加platform_code、app_code、access_token，2为platform_code、app_code、unit_code、access_token
//callback,返回值
var postDataEncry = function(url, encryData, commonData, flag, callback) {
	checkNewWork(callback);
	//拼接登录需要的签名
	var signTemp = postDataEncry1(encryData, commonData, flag);
	console.log('signTemp000:' + signTemp);
	//生成签名，返回值sign则为签名
	signHmacSHA1.sign(signTemp, 'jsy309', function(sign) {
		//组装发送握手协议需要的data
		//合并对象
		var tempData = $.extend(encryData, commonData);
		//添加签名
		tempData.sign = sign;
		console.log('传递的参数' + url + ':', JSON.stringify(tempData));
		var tempStr = JSON.stringify(tempData).replace(/\\/g, "");
		console.log('tempStr:' + tempStr);
		jQAjaxPost(url, tempStr, callback);
	});
}

// var postDataEncry2 = function(url, encryData, commonData, flag, callback) {
// 	checkNewWork(callback);
// 	//拼接登录需要的签名
// 	var signTemp = postDataEncry1(encryData, commonData, flag);
// 	console.log('signTemp000:' + signTemp);
// 	//生成签名，返回值sign则为签名
// 	signHmacSHA1.sign(signTemp, 'jsy309', function(sign) {
// 		//组装发送握手协议需要的data
// 		//合并对象
// 		var tempData = $.extend(encryData, commonData);
// 		//添加签名
// 		tempData.sign = sign;
// 		console.log('传递的参数' + url + ':', JSON.stringify(tempData));
// 		var tempStr = JSON.stringify(tempData).replace(/\\/g, "");
// 		console.log('tempStr:' + tempStr);
// 		jQAjaxPost(url, tempStr, callback);
// 	});
// }
//修改数组，改变格式
var arrayToStr1 = function(array) {
	if (array == null) {
		return '[]'
	}
	var tempStr = '';
	tempStr = array.join(',');
	tempStr = '[' + tempStr + ']';
	return tempStr;
}

//拼接参数
var postDataEncry1 = function(encryData, commonData, flag) {
	//循环
	var tempStr = '';
	for (var tempData in encryData) {
		//对value进行加密
		var encryptStr = RSAEncrypt.enctype(encryData[tempData]);
		//修改值
		encryData[tempData] = encryptStr;
	}
	//判断是否需要添加共用数据
	if (flag == 1) {
		//获取个人信息
		var personal = store.get(window.storageKeyName.PERSONALINFO);
		var comData = {
			platform_code: personal.platform_code,
			app_code: personal.app_code,
			access_token: personal.access_token
		};
		commonData = $.extend(commonData, comData);
	} else if (flag == 2) {
		//获取个人信息
		var personal = store.get(window.storageKeyName.PERSONALINFO);
		var comData = {
			platform_code: personal.platform_code,
			app_code: personal.app_code,
			unit_code: personal.unit_code,
			access_token: personal.access_token
		};
		commonData = $.extend(commonData, comData);
	} else if (flag == 3) {

	}
	//将对象转为数组
	var arr0 = [];
	for (var item in encryData) {
		arr0.push(item + '=' + encryData[item]);
	};
	var arr1 = [];
	for (var item in commonData) {
		//		if (typeof commonData[item] == Object) {
		if (commonData[item] instanceof Array) {
			console.log('000');
			arr1.push(item + '=' + JSON.stringify(commonData[item]) + '');
		} else {
			arr1.push(item + '=' + commonData[item]);
		}
	};
	//合并数组
	var signArr = arr0.concat(arr1);
	console.log('signArr:' + signArr);
	//拼接登录需要的签名
	var signTemp = signArr.sort().join('&');
	return signTemp;
}

//修改数组，改变格式
var arrayToStr = function(array) {
	if (array == null) {
		return '[]'
	}
	var tempStr = '';
	tempStr = array.join('","');
	tempStr = '[' + '"' + tempStr + '"' + ']';
	return tempStr;
}

/**
 * 发送 XMLHttpRequest post 的请求
 * @param {Object} url 路径
 * @param {Object} data 数据
 * @param {Object} callback 回调
 */
var xhrPost = function(url, commonData, callback) {
	checkNewWork(callback);
	console.log('XHRP-Url:', url);
	//	console.log('XHRP-Data:', commonData);
	//拼接登录需要的签名
	var signTemp = postDataEncry1({}, commonData, 0);
	console.log('signTemp000:' + signTemp);
	//生成签名，返回值sign则为签名
	signHmacSHA1.sign(signTemp, 'jsy309', function(sign) {
		//组装发送握手协议需要的data
		//合并对象
		var tempData = $.extend({}, commonData);
		//添加签名
		tempData.sign = sign;
		// 等待的对话框
		var urlArr = url.split('/');
		console.log('传递的参数' + urlArr[urlArr.length - 1] + ':', tempData);

		var tempStr = JSON.stringify(tempData).replace(/\\/g, "");
		jQAjaxPost(url, tempStr, callback);
	});
}

var checkNewWork = function(callback) {
	if (plus.networkinfo.getCurrentType() == plus.networkinfo.CONNECTION_NONE) {
		//console.log('没有网络');
		var data = {
			RspCode: '404',
			RspData: '',
			RspTxt: '网络异常，请检查网络设置！'
		}

		callback(data);
		return;
	}
}

var jQAjaxPost = function(url, data, callback) {
	checkNewWork(callback);
	console.log('jQAP-Data:' + data);
	jQuery.ajax({
		url: url,
		type: "POST",
		data: data,
		timeout: 10000,
		dataType: "json",
		contentType: "application/json",
		async: true,
		success: function(success_data) { //请求成功的回调
			console.log('jQAP-Success:'+ url+','+ JSON.stringify(success_data));
			if (success_data.code == 6 || success_data.code == 'sup6') { //令牌过期
				//续订令牌
				var personal = store.get(window.storageKeyName.PERSONALINFO);
				//需要参数
				var comData = {
					access_token: personal.utoken
				};
				//令牌续订
				postDataEncry('api/token/refresh', {}, comData, 0, function(data1) {
					if (data1.code == 0) {
						var tempInfo00 = store.get(window.storageKeyName.PERSONALINFO);
						tempInfo00.utoken = data1.RspData.access_token;
						store.set(window.storageKeyName.PERSONALINFO, tempInfo00);
						var urlArr = url.split('/');
						var tempData = JSON.parse(data);
						tempData.utoken = data1.RspData.access_token;
						tempData.access_token = data1.RspData.access_token;
						delete tempData.sign;
						console.log('urlArr:' + urlArr[urlArr.length - 1]);
						console.log('data:' + JSON.stringify(tempData));
						postDataEncry(url, {}, tempData, 0, function(data2) {
							data2 = modifyParameter(url, data2);
							callback(data2);
						});
					}
				});
			} else {
				success_data = modifyParameter(url, success_data);
				callback(success_data);
			}
		},
		error: function(xhr, type, errorThrown) {
			console.log('jQAP-Error777:', url, xhr, type);
			events.closeWaiting();
			mui.toast('网络连接失败,请重新尝试一下');
			callback({
				RspCode: 404,
				RspData: null,
				RspTxt: "网络连接失败,请重新尝试一下"
			});
		}
	});
}

// var tempPro = function(url, data0, callback) {
// 	checkNewWork(callback);
// 	console.log('data0:' + JSON.stringify(data0));
// 	var xhr = new XMLHttpRequest();
// 	xhr.open("post", url, true);
// 	xhr.timeout = 10000; //10秒超时
// 	xhr.contentType = 'application/json;';
// 	xhr.onload = function(e) {
// 		console.log("XHRP:onload:", JSON.stringify(e));
// 		console.log('this.readyState:', this.readyState);
// 		console.log('this.status', this.status);
// 		if (this.readyState === 4 && this.status === 200) {
// 			var urlArr = url.split('/');
// 			var success_data = JSON.parse(this.responseText);
// 			console.log('XHRP-Success:', JSON.stringify(success_data));
// 			if (success_data.RspCode == 10 || success_data.code == 6) { //令牌过期
// 				//续订令牌
// 				var publicParameter = store.get(window.storageKeyName.PUBLICPARAMETER);
// 				var personal = store.get(window.storageKeyName.PERSONALINFO);
// 				//需要参数
// 				var comData = {
// 					access_token: personal.utoken
// 				};
// 				//令牌续订
// 				postDataEncry('api/token/refresh', {}, comData, 0, function(data1) {
// 					if (data1.RspCode == 0) {
// 						var tempInfo00 = store.get(window.storageKeyName.PERSONALINFO);
// 						tempInfo00.utoken = data1.RspData.access_token;
// 						store.set(window.storageKeyName.PERSONALINFO, tempInfo00);
// 						//						data0.utoken = data1.RspData;
// 						delete data0.sign;
// 						tempPro(url, data0, function(data2) {
// 							data2 = modifyParameter(url, data2);
// 						});
// 					}
// 				});
// 			} else {
// 				success_data = modifyParameter(url, success_data);
// 				callback(success_data);
// 			}
// 		} else {
// 			callback({
// 				RspCode: 404,
// 				RspData: null,
// 				RspTxt: "网络连接失败,请重新尝试一下"
// 			});
// 		}
// 	}
// 	xhr.ontimeout = function(e) {
// 		console.log("XHRP:ontimeout222:", e);
// 		callback({
// 			RspCode: 404,
// 			RspData: null,
// 			RspTxt: "网络连接失败,请重新尝试一下"
// 		});
// 	};
// 	xhr.onerror = function(e) {
// 		console.log("XHRP:onerror111:", e);
// 		callback({
// 			RspCode: 404,
// 			RspData: null,
// 			RspTxt: "网络连接失败,请重新尝试一下"
// 		});
// 	};
// 	xhr.send(JSON.stringify(data0));
// }

var modifyParameter = function(url, model) {
	// if(model.msg) {
	// 	repalceKey(model, 'code', 'RspCode');
	// 	repalceKey(model, 'data', 'RspData');
	// 	repalceKey(model, 'msg', 'RspTxt');
	// }
	return model;
}

//更换personal 对象的key 值
var repalceKey = function(obj, oldKey, newKey) {
	if (obj instanceof Array) {
		for (var i in obj) {
			obj[i][newKey] = obj[i][oldKey];
			delete obj[i][oldKey];
		}
	} else {
		obj[newKey] = obj[oldKey];
		delete obj[oldKey];
	}
}

//合并参数
var extendParameter = function(data0) {
	var personal = store.get(window.storageKeyName.PERSONALINFO);
	var publicPar = store.get(window.storageKeyName.PUBLICPARAMETER);
	var tempData = {
		uuid: publicPar.uuid,
		appid: publicPar.appid,
		token: personal.utoken
	}
	return $.extend(data0, tempData);
}
