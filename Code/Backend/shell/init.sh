#! /bin/bash

# BASE_DIR ##/vue-msf/data/www
# PROJECT  ##项目名称
# PROJECT_DIR ##项目目录
# VERSION ##当前版本
# ARCHIVE ##附件地址
# PLATFORM ##平台
# MSF_ENV  ##环境变量

DATE=`date +%Y%m%d%H%M%S`

WORK_DIR=/vue-msf/Cdiscount-API/


if [ -f ${PROJECT_DIR}/Code/Middleend/config/index.js ]; then
	##修改mongodb连接
	grep 'MONGODB_HOST' -rl ${PROJECT_DIR}/Code/Middleend/config/index.js | xargs sed -i "s/MONGODB_HOST/${MONGODB_HOST}/g"
	grep 'MONGODB_PORT' -rl ${PROJECT_DIR}/Code/Middleend/config/index.js | xargs sed -i "s/MONGODB_PORT/${MONGODB_PORT}/g"
	grep 'MONGODB_USERNAME' -rl ${PROJECT_DIR}/Code/Middleend/config/index.js | xargs sed -i "s/MONGODB_USERNAME/${MONGODB_USERNAME}/g"
	grep 'MONGODB_PASSWORD' -rl ${PROJECT_DIR}/Code/Middleend/config/index.js | xargs sed -i "s/MONGODB_PASSWORD/${MONGODB_PASSWORD}/g"
fi


##copy supervisor config

cp ${PROJECT_DIR}/Code/Backend/shell/supervisor/conf/*.conf  /vue-msf/supervisor/conf.d/ && \
chown super.super -R /vue-msf/supervisor/conf.d/

if [ ! -d ${WORK_DIR} ];then
	sudo mkdir -p ${WORK_DIR} && sudo chown super.super -R ${WORK_DIR}
fi 

#安装 ss proxy

pip install shadowsocks

mkdir -p /etc/shadowsocks/pid/

echo -e "\
{\n\
\"server\":\"${CDISCOUNT_SS_HOST[1080]}\", \n\
\"server_port\":${CDISCOUNT_SS_SERVER_PORT}, \n\
\"local_address\": \"0.0.0.0\", \n\
\"local_port\":1080, \n\
\"password\":\"${CDISCOUNT_SS_PASSWORD}\", \n\
\"timeout\":600, \n\
\"method\":\"${CDISCOUNT_SS_METHOD}\" \n\
}" > /etc/shadowsocks/config_1080.json

	
echo -e "\
{\n\
\"server\":\"${CDISCOUNT_SS_HOST[1081]}\", \n\
\"server_port\":${CDISCOUNT_SS_SERVER_PORT}, \n\
\"local_address\": \"0.0.0.0\", \n\
\"local_port\":1081, \n\
\"password\":\"${CDISCOUNT_SS_PASSWORD}\", \n\
\"timeout\":600, \n\
\"method\":\"${CDISCOUNT_SS_METHOD}\" \n\
}" > /etc/shadowsocks/config_1081.json

echo -e "\
{\n\
\"server\":\"${CDISCOUNT_SS_HOST[1082]}\", \n\
\"server_port\":${CDISCOUNT_SS_SERVER_PORT}, \n\
\"local_address\": \"0.0.0.0\", \n\
\"local_port\":1082, \n\
\"password\":\"${CDISCOUNT_SS_PASSWORD}\", \n\
\"timeout\":600, \n\
\"method\":\"${CDISCOUNT_SS_METHOD}\" \n\
}" > /etc/shadowsocks/config_1082.json

echo -e "\
{\n\
\"server\":\"${CDISCOUNT_SS_HOST[1083]}\", \n\
\"server_port\":${CDISCOUNT_SS_SERVER_PORT}, \n\
\"local_address\": \"0.0.0.0\", \n\
\"local_port\":1083, \n\
\"password\":\"${CDISCOUNT_SS_PASSWORD}\", \n\
\"timeout\":600, \n\
\"method\":\"${CDISCOUNT_SS_METHOD}\" \n\
}" > /etc/shadowsocks/config_1083.json

echo -e "\
{\n\
\"server\":\"${CDISCOUNT_SS_HOST[1084]}\", \n\
\"server_port\":${CDISCOUNT_SS_SERVER_PORT}, \n\
\"local_address\": \"0.0.0.0\", \n\
\"local_port\":1084, \n\
\"password\":\"${CDISCOUNT_SS_PASSWORD}\", \n\
\"timeout\":600, \n\
\"method\":\"${CDISCOUNT_SS_METHOD}\" \n\
}" > /etc/shadowsocks/config_1084.json

echo -e "\
{\n\
\"server\":\"${CDISCOUNT_SS_HOST[1085]}\", \n\
\"server_port\":${CDISCOUNT_SS_SERVER_PORT}, \n\
\"local_address\": \"0.0.0.0\", \n\
\"local_port\":1085, \n\
\"password\":\"${CDISCOUNT_SS_PASSWORD}\", \n\
\"timeout\":600, \n\
\"method\":\"${CDISCOUNT_SS_METHOD}\" \n\
}" > /etc/shadowsocks/config_1085.json


echo -e "\
{\n\
\"server\":\"${CDISCOUNT_SS_HOST[1086]}\", \n\
\"server_port\":${CDISCOUNT_SS_SERVER_PORT}, \n\
\"local_address\": \"0.0.0.0\", \n\
\"local_port\":1086, \n\
\"password\":\"${CDISCOUNT_SS_PASSWORD}\", \n\
\"timeout\":600, \n\
\"method\":\"${CDISCOUNT_SS_METHOD}\" \n\
}" > /etc/shadowsocks/config_1086.json

echo -e "\
{\n\
\"server\":\"${CDISCOUNT_SS_HOST[1087]}\", \n\
\"server_port\":${CDISCOUNT_SS_SERVER_PORT}, \n\
\"local_address\": \"0.0.0.0\", \n\
\"local_port\":1087, \n\
\"password\":\"${CDISCOUNT_SS_PASSWORD}\", \n\
\"timeout\":600, \n\
\"method\":\"${CDISCOUNT_SS_METHOD}\" \n\
}" > /etc/shadowsocks/config_1087.json

echo -e "\
{\n\
\"server\":\"${CDISCOUNT_SS_HOST[1088]}\", \n\
\"server_port\":${CDISCOUNT_SS_SERVER_PORT}, \n\
\"local_address\": \"0.0.0.0\", \n\
\"local_port\":1088, \n\
\"password\":\"${CDISCOUNT_SS_PASSWORD}\", \n\
\"timeout\":600, \n\
\"method\":\"${CDISCOUNT_SS_METHOD}\" \n\
}" > /etc/shadowsocks/config_1088.json


#if [ `grep "shadowsocks" -c /vue-msf/bin/init.sh` -ne '0' ];then

echo -e "\
sudo /usr/local/bin/sslocal -c /etc/shadowsocks/config_1080.json -d start --pid-file /etc/shadowsocks/pid/pid-1080 \n\
sudo /usr/local/bin/sslocal -c /etc/shadowsocks/config_1081.json -d start --pid-file /etc/shadowsocks/pid/pid-1081 \n\
sudo /usr/local/bin/sslocal -c /etc/shadowsocks/config_1082.json -d start --pid-file /etc/shadowsocks/pid/pid-1082 \n\
sudo /usr/local/bin/sslocal -c /etc/shadowsocks/config_1083.json -d start --pid-file /etc/shadowsocks/pid/pid-1083 \n\
sudo /usr/local/bin/sslocal -c /etc/shadowsocks/config_1084.json -d start --pid-file /etc/shadowsocks/pid/pid-1084 \n\
sudo /usr/local/bin/sslocal -c /etc/shadowsocks/config_1085.json -d start --pid-file /etc/shadowsocks/pid/pid-1085 \n\
sudo /usr/local/bin/sslocal -c /etc/shadowsocks/config_1086.json -d start --pid-file /etc/shadowsocks/pid/pid-1086 \n\
sudo /usr/local/bin/sslocal -c /etc/shadowsocks/config_1087.json -d start --pid-file /etc/shadowsocks/pid/pid-1087 \n\
sudo /usr/local/bin/sslocal -c /etc/shadowsocks/config_1088.json -d start --pid-file /etc/shadowsocks/pid/pid-1088 \n\
" >> /vue-msf/bin/init.sh

#fi

#安装 chrome 相关扩展
yum install pango.x86_64 \
			libXcomposite.x86_64 \
			libXcursor.x86_64 \
			libXdamage.x86_64 \
			libXext.x86_64 \
			libXi.x86_64 \
			libXtst.x86_64 \
			cups-libs.x86_64 \
			libXScrnSaver.x86_64 \
			libXrandr.x86_64 \
			GConf2.x86_64 \
			alsa-lib.x86_64 \
			atk.x86_64 gtk3.x86_64 -y

yum install ipa-gothic-fonts \
			xorg-x11-fonts-100dpi \
			xorg-x11-fonts-75dpi \
			xorg-x11-utils \
			xorg-x11-fonts-cyrillic \
			xorg-x11-fonts-Type1 \
			xorg-x11-fonts-misc -y

cd ${PROJECT_DIR}/Code/Middleend/ && npm install

#echo "webpack build"
#
#npm run build
#
###dist cp
#if [ -d ${PROJECT_DIR}/Code/Middleend/dist/ ]; then
#
#	cd ${PROJECT_DIR}/Code/Middleend/dist/ && cp -r ../node_modules ./ && cp ../package.json ./
#
#	zip dist-${DATE}.zip -r *
#
#	cp dist-${DATE}.zip ${WORK_DIR} && cd ${WORK_DIR} && unzip -o -q dist-${DATE}.zip -d ${WORK_DIR}
#
#	if [ -f dist-${DATE}.zip ]; then
#		rm -rf dist-${DATE}.zip
#	fi
#
#fi


