
import {
  Card,

  CardDescription,

  CardFooter,
  CardHeader,
} from "@/components/ui/card"
import { Host } from "./Host";
import { Badge } from "./components/ui/badge";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDesktop } from '@fortawesome/free-solid-svg-icons';

const HostCard = ( { host}: { host: Host }) => {
  return (
    <Card style={{margin:5}}>
      <CardHeader style={{padding:10}}>
      <FontAwesomeIcon icon={faDesktop} size="2xl" />

      </CardHeader>
      <CardDescription style={{marginLeft:20, marginRight: 20}}>{host.Ip}</CardDescription>
      <CardFooter className="flex justify-end	" style={{padding:10}}>

      {host.Ports.map((port) => (
        <Badge variant={"outline"}>{port}</Badge>
      ))}
      </CardFooter>
    </Card>
  );
};

export default HostCard;