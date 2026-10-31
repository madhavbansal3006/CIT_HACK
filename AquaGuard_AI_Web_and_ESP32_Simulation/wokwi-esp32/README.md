# ESP32 / Wokwi starter

The Arduino sketch compiles as an ESP32 Arduino project. GPIO18 and GPIO19 count pulses from two flow sensors; GPIO25 is a test button; GPIO26 and GPIO27 are logic outputs representing pump and valve driver commands; GPIO2 is the status LED.

The diagram file is a starter, not a guaranteed final circuit. Depending on the Wokwi editor's current component catalog, you may need to add/connect parts in the UI. The sketch will compile without the flow sensors present, but readings remain zero until pulses are provided. The TEST LEAK button applies a demo-only 40% reduction to the calculated outlet reading; this is for simulation demonstration only and must be disabled for physical sensor testing.

To make the simulated circuit more expressive, add two pulse generators or suitable button circuits to GPIO18 and GPIO19, plus LEDs (with resistors) on GPIO26 and GPIO27 to visualize the output signals. Verify the correct Wokwi part names and connections in the editor.

Real hardware safety: never drive a pump/solenoid directly from GPIO. Use suitable rated drivers, power supplies, flyback protection where applicable, and test safely.