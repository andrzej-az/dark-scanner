import { Button } from "@/components/ui/button";
import { ThemeProvider } from "@/components/theme-provider";
import { MaskInput } from "./components/ui/mask-input";
import { EventsOn, WindowMaximise, WindowMinimise, WindowUnmaximise } from '../wailsjs/runtime'
import { Exit, Scan } from '../wailsjs/go/main/App'
import { SetStateAction, useState } from "react";
import HostCard from "./card";
import { Host } from "./Host";
import { Label } from "./components/ui/label";
import { Progress } from "./components/ui/progress";
import {  CopyIcon, Cross1Icon,  MinusIcon, SquareIcon } from '@radix-ui/react-icons'

let _scanData = [] as Host[]

function App() {
  const [scanData, setScanData] = useState([] as Host[])
  let [startIp, setStartIp] = useState('');
  const [endIp, setEndIp] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);

  const handleOnScanStart = (setEnabled: (arg0: boolean) => void) => {
    return () => {
      console.log(`Received event: onScanStart`);
      setEnabled(false);
      setProgress(0);
      setShowProgress(true)

    };
  };
  const handleOnScanStop = (setEnabled: (arg0: boolean) => void, setShowProgress: (arg0: boolean) => void) => {
    return () => {
      console.log(`Received event: onScanStop`);
      setEnabled(true);
      setShowProgress(false)
    };
  };
  const handleOnHostFound = (_scanData: Host[], setScanData: (arg0: Host[]) => void) => {
    return (data: Host) => {
      const matchingItem = _scanData.find((item) => item.Ip === data.Ip);
      if (!matchingItem) {
        _scanData = [..._scanData, data].sort((a, b) => a.Ip.localeCompare(b.Ip));
        setScanData(_scanData);
      }

      // console.log(`Received event: ${JSON.stringify(data)}`);
      // console.log(`ScanData is : ${JSON.stringify(_scanData)}`);
    };
  };
  const handleOnHostScanFinish = (_scanData: Host[], setScanData: (arg0: Host[]) => void) => {
    return (data: Host) => {
      const matchingItem = _scanData.find((item) => item.Ip === data.Ip);
      if (!matchingItem) {
        _scanData = [..._scanData, data].sort((a, b) => a.Ip.localeCompare(b.Ip));
        setScanData(_scanData);
      } else {
        matchingItem.Ports = data.Ports;
        setScanData(_scanData);

      }

      // console.log(`Received event: ${JSON.stringify(data)}`);
      // console.log(`ScanData is : ${JSON.stringify(_scanData)}`);
    };
  };
  const handleProgress = (setProgress: (arg0: number) => void) => {
    return (progress: number) => {
      console.log(`Received event: OnProgress: ${progress}`);
      setProgress(progress);
    };
  };
  EventsOn('onHostFound', handleOnHostFound(_scanData, setScanData));
  EventsOn('onScanStart', handleOnScanStart(setEnabled));
  EventsOn('onScanFinish', handleOnScanStop(setEnabled, setShowProgress));
  EventsOn('OnHostScanFinish', handleOnHostScanFinish(_scanData, setScanData));
  EventsOn('OnProgress', handleProgress(setProgress));

  function adjustEndIp(value: SetStateAction<string>): void {
    if (!endIp) {
      const newLastOctet = 255;
      const newEndIp = value.toString().split('.').slice(0, -1).join('.') + `.${newLastOctet}`;
      setEndIp(newEndIp);
    }
  }
  const [isMaximized, setIsMaximized] = useState(false);
  const SetWindowUnmaximise = () => {
    // Your unmaximize function
    setIsMaximized(false);
    WindowUnmaximise();
  };

  const SetWindowMaximise = () => {
    // Your maximize function
    setIsMaximized(true);
    WindowMaximise();
  };
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="titlebar flex justify-center items-center pl-2">
       <Button variant="ghost" className="px-4"><svg width="20" height="20" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.5 3C1.22386 3 1 3.22386 1 3.5C1 3.77614 1.22386 4 1.5 4H13.5C13.7761 4 14 3.77614 14 3.5C14 3.22386 13.7761 3 13.5 3H1.5ZM1 7.5C1 7.22386 1.22386 7 1.5 7H13.5C13.7761 7 14 7.22386 14 7.5C14 7.77614 13.7761 8 13.5 8H1.5C1.22386 8 1 7.77614 1 7.5ZM1 11.5C1 11.2239 1.22386 11 1.5 11H13.5C13.7761 11 14 11.2239 14 11.5C14 11.7761 13.7761 12 13.5 12H1.5C1.22386 12 1 11.7761 1 11.5Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
        </Button>
       
        <div className="px-4 ml-auto flex justify-center items-center text-gray-400" >Dark scanner</div>
        <div className="px-4 ml-auto flex justify-center items-center">
        <Button variant="ghost" className="pl-2 pr-2" onClick={() => WindowMinimise()}><MinusIcon /></Button>
        {isMaximized? 
        (<Button variant="ghost" className="pl-2 pr-2" onClick={() => SetWindowUnmaximise()}><CopyIcon /></Button>):
        (<Button variant="ghost" className="pl-2 pr-2" onClick={() => SetWindowMaximise()}><SquareIcon /></Button>)}

        <Button variant="ghost" className="pl-2 pr-2" onClick={() =>Exit()}><Cross1Icon /></Button>
        </div>
      </div>
      
      <div className="bg-zinc-950 dark:bg-dark min-h-screen mx-auto pb-8 pt-12" >


        <div className="flex flex-row space-x-2 justify-center pt-3">
          <div ><Label>Start IP</Label><MaskInput aria-label="Enter start IP" value={startIp} onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter' && startIp && endIp) {
              Scan({ StartIp: startIp, EndIp: endIp });
            }
          }} onBlur={(e: { currentTarget: { value: SetStateAction<string>; }; }) => adjustEndIp(e.currentTarget.value)} onChange={(e: { currentTarget: { value: SetStateAction<string>; }; }) => setStartIp(e.currentTarget.value)} style={{ maxWidth: '12rem' }} />
          </div>
          <div className="flex flex-col-reverse	"><span style={{ paddingBottom: 10 }}>-</span></div>
          <div>
            <Label>End IP</Label>
            <MaskInput value={endIp} onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'Enter' && startIp && endIp) {
                Scan({ StartIp: startIp, EndIp: endIp });
              }
            }} onChange={(e: { currentTarget: { value: SetStateAction<string>; }; }) => setEndIp(e.currentTarget.value)} style={{ maxWidth: '12rem' }} />
          </div>
          <div className="flex flex-col-reverse	"><Button disabled={!enabled} variant="secondary" onClick={() => { Scan({ StartIp: startIp, EndIp: endIp }) }}>
            SCAN
          </Button></div>
        </div>
        <div className="flex flex-row space-x-2 justify-center" style={{ height: 10, margin: 10, marginTop: 20 }}>
          {showProgress && (<Progress value={progress} style={{ height: 5 }} />)}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', margin: 20 }}>
          {scanData.map((card, index) => (
            <HostCard key={index} host={card} />
          ))}
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;

