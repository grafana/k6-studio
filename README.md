# k6-studio

## Requirements

- nodejs >= v20

## Dev install

```
npm install
npm start
```

## Troubleshooting

Currently any code change will trigger an hotreload causing the proxy service to possibly leak while starting a new one. 
If you encounter issues with the proxy please kill the service:

```
ps aux | grep mitmdump
kill -9 <id>
```
