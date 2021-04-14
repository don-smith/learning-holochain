import path from "path";
import { Orchestrator, Config, InstallAgentsHapps } from "@holochain/tryorama";

const conductorConfig = Config.gen();

// Construct proper paths for your DNAs
const dnaPath = path.join(__dirname, "../../workdir/dna/greeter.dna");

// create an InstallAgentsHapps array with your DNAs to tell tryorama what
// to install into the conductor.
const installation: InstallAgentsHapps = [
  // agent 0
  [
    // happ 0
    [dnaPath],
  ],
];

const orchestrator = new Orchestrator();

orchestrator.registerScenario("holo says hello", async (s, t) => {
  const [alice] = await s.players([conductorConfig]);

  // install your happs into the coductors and destructuring the returned happ data using the same
  // array structure as you created in your installation array.
  const [[alice_common]] = await alice.installAgentsHapps(installation);

  const result = await alice_common.cells[0].call("greeter", "hello", null);
  t.equal(result, "Hello Holo Dev");
});

orchestrator.run();
