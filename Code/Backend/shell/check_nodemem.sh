#!/bin/bash

#1.判断异常node进程
nodePid=$(ps -ef | grep node | grep app.js | awk '{print $2}')
echo "node主进程:$nodePid"

mainPid=$(ps -ef | grep $nodePid | grep -v app.js | grep -v grep | awk '{print $2}')
echo "puppeteer主进程:$mainPid"

ppids=$(ps -ef | grep puppeteer | grep -v grep | grep -v disable-background-networking | awk '{print $3}')
for ppid in $ppids
do
  if [[ $ppid -ne $mainPid ]]; then
     kill -9 $ppid
     echo "非正常node进程 $ppid 强制关闭"
     curl "http://robot.cxiangnet.cn/robot.php?message=${HOSTNAME}存在异常node进程 $ppid ,强制关闭&phone=18840382350"
  fi
  echo "$ppid父进程等于$mainPid,一切正常"
done

#2.判断内存是否大于6GB
usedMem=$(free -m | grep Mem | awk '{print $3}')
echo "当前内存:${usedMem}M"
if [[ $usedMem -gt 6000 ]]; then
  /usr/local/bin/supervisorctl restart shopee-api 
  curl "http://robot.cxiangnet.cn/robot.php?message=${HOSTNAME}内存过高重启服务&phone=18840382350"
fi
echo "当前内存${usedMem}M没有大于10GB"
