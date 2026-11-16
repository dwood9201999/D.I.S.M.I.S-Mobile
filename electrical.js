export const parts = {
  loop: ['AM loop coil', 'Turns of insulated wire around a frame, with two electrical ends. A center tap is possible.', 'Use a matched medium-wave crystal-set kit from an electronics supplier.', 'Check the kit diagram to identify the two ends and any tap. Low resistance across the winding can be normal.'],
  capacitor: ['Variable tuning capacitor', 'A knob moves one set of metal plates between another set. Small plastic-bodied units may hide the plates.', 'Use the capacitor supplied with the AM loop kit.', 'Locate the specified rotor/common and stator terminal. Do not guess at extra terminals.'],
  diode: ['Detector diode', 'A small glass or molded body with a thin lead at each end. The band normally marks the cathode.', 'Buy the detector model called for by the receiver kit from a component supplier.', 'Match the band against the kit drawing. Verify the part number before soldering.'],
  ear: ['High-impedance crystal earpiece', 'A small single-ear transducer with two leads or a plug.', 'Look for the high-impedance or crystal earpiece specified by the radio kit.', 'Use the kit-approved input impedance. A standard low-impedance earbud can make this circuit nearly silent.'],
  resistor: ['Earpiece shunt resistor', 'A small body with leads on both ends and often colored bands.', 'Use the supplied or specified value from the kit.', 'Verify the value out of circuit with an ohmmeter or the kit parts list. A resistor has no positive or negative end.'],
  meter: ['Digital multimeter', 'Handheld display, selector dial, and ports such as COM, VΩ, and A or mA.', 'Find one at an electronics or hardware store. Inspect leads for damaged insulation.', 'For voltage on these low-voltage setups, connect black to COM and red to VΩ. Select DC volts. Measure across the points. Use resistance or continuity only with power removed.'],
  motor: ['Brushed permanent-magnet DC motor', 'Often a cylindrical metal case with a spinning shaft and two labeled terminals or pigtails.', 'Buy a labeled hobby motor or use a known part from a battery-powered toy after removing its batteries.', 'Confirm the type and ratings from the label or datasheet. Two wires alone do not establish what is inside.'],
  regulator: ['DC voltage regulator module', 'Small board or enclosed box with input and output pairs. Look for IN+/IN− and OUT+/OUT− or the manual’s equivalents.', 'Use a documented module from an electronics supplier.', 'Match its allowed input range to measurements and known speed limits. Check output voltage, polarity, and load current limits before connecting a load.'],
  load: ['Rated test load', 'A low-voltage lamp or approved load with two inputs and a voltage/current label.', 'Use a documented bench load from a hobby electronics supplier.', 'Match the voltage and current to the regulated output. Begin with a small load.'],
  crank: ['Regulated hand-crank USB source', 'An enclosed body with a folding handle and labeled USB output.', 'Choose a commercial emergency power bank with a manual and protected internal storage.', 'Verify the supported USB output, how to charge it by hand, and whether it supports the receiver’s startup current.'],
  receiver: ['AM/FM or weather receiver', 'A labeled tuning control or display, speaker, antenna, and a battery compartment or USB power input.', 'Find one at an emergency-preparedness or electronics retailer.', 'Confirm USB can power operation, and confirm NOAA weather-band reception and standby alerts separately if required.'],
  usb: ['Approved USB cable or inline meter', 'Look for matching connectors. An inline meter has a USB input and output plus a small display.', 'Use a manufacturer-approved cable and a meter rated for the voltage and current.', 'Follow the meter’s input/output direction. Plug keyed connectors in gently. The cable does not make incompatible voltage or charging modes safe.'],
  panel: ['Solar panel', 'Flat grid of dark cells with a label on the rear and a pair of output leads.', 'Use a documented panel from a solar supplier or matched starter kit.', 'Record Voc, operating voltage and current. Check cold-weather Voc against the controller’s maximum before installation. A lit panel makes voltage.'],
  controller: ['Solar charge controller', 'Box with labeled PV and BAT terminal pairs, sometimes with a third LOAD pair.', 'Buy with the panel and battery as a matched kit or confirm every rating against the manuals.', 'Confirm battery chemistry, voltage, charge settings, fusing, PV limits and sequence. A LOAD output may have a smaller current rating.'],
  battery: ['Protected battery', 'Enclosed case with polarity markings, a chemistry label and rated voltage.', 'Use a commercially protected pack approved by the charge controller maker.', 'Identify the positive and negative terminals by markings and manual. Avoid damaged or unidentified packs.'],
  fuse: ['DC-rated fuse and holder', 'A removable fuse in an insulated inline holder with wire connections on both sides.', 'Use the manufacturer-specified DC fuse and holder from an electrical supplier.', 'Check the DC voltage and interruption ratings and the specified fuse size. The holder goes into the positive path where the manufacturer specifies.'],
  turbine: ['Water turbine or wind rotor', 'Water units have an impeller or runner. Wind units have blades on a hub.', 'Use manufacturer-built assemblies with documented operating limits.', 'Confirm site conditions and manufacturer specifications before selecting equipment or wiring. Rotor and turbine projects need guarding and overspeed control.'],
  handheld: ['Two-way handheld radio', 'Speaker grille, antenna, channel display or selector, and push-to-talk button on the side.', 'Find labeled, certified radios from a communications supplier.', 'Match the radio service, channel, and any tone settings. Use the approved charger and battery.'],
};

const crystal = {
  parts: ['loop','capacitor','diode','ear','resistor'],
  wiring: [
    ['Coil end 1 and one capacitor terminal', 'TUNED node', 'Join these and the unbanded diode end at the same connection point.'],
    ['Coil end 2 and the other capacitor terminal', 'RETURN node', 'Join these to the return ends of the earpiece and resistor.'],
    ['Banded diode end', 'AUDIO node', 'Join it to the remaining earpiece and resistor ends. The resistor and earpiece share the same two nodes.'],
  ],
  checks: 'With the passive assembly disconnected from other equipment, trace each node on paper and then on the bench. Remove enamel from coil leads only as directed by the kit. Use the kit’s soldering or terminal method. Tune and rotate the indoor loop near a known local AM signal. A faint station is a valid first result.',
};
export const electrical = {
  g14: crystal,
  'radio-crystal-loop': crystal,
  'radio-crank-kit': {
    parts: ['crank','usb','receiver','meter'],
    wiring: [['Crank unit USB OUT','Inline USB meter IN','Use the specified USB connector and cable.'],['Meter OUT','Receiver USB power IN','Unplug the meter for normal use and connect with the approved cable. Nothing connects to bare battery leads.']],
    checks: 'Verify steady receiver operation under load at a fixed volume. Start with a charged source. If the receiver cycles off or restarts, check cable fit and whether the source can sustain the load.',
  },
  g10: {
    parts: ['panel','controller','battery','fuse','meter'],
    wiring: [['Battery +','Specified DC fuse/disconnect → controller BAT+','Size protection and wire from the model manuals. Keep exposed conductors covered.'],['Battery −','Controller BAT−','Use the approved terminal and torque or supplied connector.'],['Panel + and −','Corresponding controller PV+ and PV−','Use approved connectors and keep PV isolated until the manual calls for connection. Match labels, not connector appearance alone.']],
    checks: 'This is a wiring map for a documented compatible kit. Before assembly, use the actual manuals for the exact terminals, torque, protection, isolator location and connection sequence. Verify polarity at the disconnected ends. Check for normal charge status before adding a load. Keep this setup separate from household wiring.',
  },
  g11: {
    parts: ['motor','meter','regulator','fuse','load'],
    wiring: [['Motor terminals','DC-voltage probes during the hand-spin test','Clip probes with the shaft stopped. Use black in COM and red in VΩ. Keep hands and leads away from the moving drive.'],['Confirmed motor + and −','Documented regulator IN+ and IN−','Connection planning only. Use a speed-limited, guarded setup with appropriate overvoltage, reverse-polarity and overcurrent protection.'],['Regulator OUT+ and OUT−','Matching test-load terminals via specified protection','Verify regulated polarity and voltage before attaching even a small load.']],
    checks: 'Initial success is a repeatable open-circuit measurement when turning the motor by hand. Mark rotation direction and polarity. A negative meter reading means polarity is reversed relative to the chosen probes. The unloaded reading alone cannot establish safe output at pedaling speed.',
  },
  g12: {
    parts: ['turbine','controller','load'],
    wiring: [],
    checks: 'This is a site assessment. A wind turbine may need a dedicated diversion controller and dump load, and a hydro alternator may need a matched rectifier and controller. The generator’s output type, voltage under overspeed, and model-specific shutdown circuit determine the wiring. Use manufacturer drawings and a qualified installer before connecting equipment.',
  },
  g19: {
    parts: ['motor','meter'],
    wiring: [['Motor lead A','Red VΩ probe','Clip only with shaft stationary and the motor disconnected from its original equipment.'],['Motor lead B','Black COM probe','Select DC voltage and slowly turn the unpowered shaft by hand.']],
    checks: 'Write down whether the meter shows voltage and its sign for one direction, then try the opposite direction. A reversed sign is expected from a suitable brushed permanent-magnet motor. No output can mean the motor type differs, speed is too low, or a connection is open. Keep the part disconnected until you identify it.',
  },
  g13: { parts: ['receiver','crank'], wiring: [], checks: 'Identify the power input and controls from the receiver manual. Use the approved cable or specified batteries and run a reception check at the location where you will use it.' },
  'radio-weather-alerts': { parts: ['receiver'], wiring: [], checks: 'Locate the labeled weather band and alert standby controls in your manual. Follow its battery polarity marks. Receiving the voice broadcast is a separate check from receiving a scheduled standby alert test.' },
  'radio-walkie-talkies': { parts: ['handheld'], wiring: [], checks: 'Locate push-to-talk and the channel selector before the drill. Only use the supplied or approved power accessories. Leave the antenna and internal wiring intact.' },
};
