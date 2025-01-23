// MyDrawerContent.tsx
import {  DrawerClose, DrawerContent, DrawerFooter } from "./components/ui/drawer";
import { Accordion, AccordionContent, AccordionTrigger } from "./components/ui/accordion";
import { AccordionItem } from "@radix-ui/react-accordion";
import { Button } from "./components/ui/button";
const SettingsBlock: React.FC = () => {
  return (
    <DrawerContent>
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>History</AccordionTrigger>
          <AccordionContent>
            Yes. It adheres to the WAI-ARIA design pattern.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Settings</AccordionTrigger>
          <AccordionContent>
            Yes. It adheres to the WAI-ARIA design pattern.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>About</AccordionTrigger>
          <AccordionContent>
            Yes. It adheres to the WAI-ARIA design pattern.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <DrawerFooter>
        <DrawerClose>
          <Button variant="outline">Cancel</Button>
        </DrawerClose>
      </DrawerFooter>
    </DrawerContent>
  );
};

export default SettingsBlock;