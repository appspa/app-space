function define(name, value) {
    Object.defineProperty(exports, name, {
        value:      value,
        enumerable: true
    });
}

//定义支持的平台
define("IOS", 1);
define("IOS_NAME", 'iOS');
define("ANDROID", 2);
define("ANDROID_NAME", 'Android');
define("WINDOWS", 3);
define("WINDOWS_NAME", 'Windows');

//定义支持的应用类型
define("REACT_NATIVE", 1);
define("REACT_NATIVE_NAME", 'React-Native');
define("CORDOVA", 2);
define("CORDOVA_NAME", 'Cordova');
define("NATIVE", 3);
define("NATIVE_NAME", 'Native');

define("PRODUCTION", 'Production');
define("STAGING", 'Staging');


define("IS_MANDATORY_YES", 1);
define("IS_MANDATORY_NO", 0);


define("IS_DISABLED_YES", 1);
define("IS_DISABLED_NO", 0);


define("RELEAS_EMETHOD_PROMOTE", 'Promote');
define("RELEAS_EMETHOD_UPLOAD", 'Upload');

define("DEPLOYMENT_SUCCEEDED", 1);
define("DEPLOYMENT_FAILED", 2);

define("DIFF_MANIFEST_FILE_NAME", 'hotcodepush.json');

//文本文件是否使用google diff-match-patch 计算差异
define("IS_USE_DIFF_TEXT_NO", 0);
define("IS_USE_DIFF_TEXT_YES", 1);


define("CURRENT_DB_VERSION", '0.5.0');


