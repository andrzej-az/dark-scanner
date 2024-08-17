import { Button } from "@/components/ui/button";
import { ThemeProvider } from "@/components/theme-provider";
import { MaskInput } from "./components/ui/mask-input";
import { EventsOn } from '../wailsjs/runtime'
import { Scan } from '../wailsjs/go/main/App'
import { SetStateAction, useState } from "react";
import HostCard from "./card";
import { Host } from "./Host";
import { Label } from "./components/ui/label";
import { Progress } from "./components/ui/progress";
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

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="bg-zinc-950 dark:bg-dark min-h-screen mx-auto py-8">


        <div className="flex flex-row space-x-2 justify-center">
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

