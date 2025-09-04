import { $ } from "bun";
import Client from "mpp-client-net";
import child_process, {
    type ChildProcessWithoutNullStreams
} from "node:child_process";

const cl = new Client(
    "wss://mppclone.com:8443",
    process.env.MPPNET_TOKEN as string
);

cl.start();
//cl.setChannel("✧𝓓𝓔𝓥 𝓡𝓸𝓸𝓶✧");
//cl.setChannel("Pianoverse");
cl.setChannel("cheez");

let prefix = "$";
let evalPrefix = "j>";

cl.on("hi", () => {
    console.log("Connected to MPP.net");
});

$.env({});

const whitelist = [
    "ead940199c7d9717e5149919",
    "dc23c5b1049092f802c71cfa",
    "02dafc1f472aecf6cc9eaf5f",
    "dd96f90fe059a58533a143bf",
    "hri7566"
];

cl.on("a", async msg => {
    console.log(`${msg.p._id.substring(0, 6)} ${msg.p.name}: ${msg.a}`);
    if (!msg.a.startsWith(evalPrefix)) return;

    try {
        const out = eval(msg.a.substring(evalPrefix.length));
        cl.sendChat(`🐈 ${out}`);
    } catch (err) {
        cl.sendChat(`💀 ${err}`);
    }
});

let proc: ChildProcessWithoutNullStreams | undefined;

cl.on("a", async msg => {
    if (!msg.a.startsWith(prefix)) return;

    try {
        const input = msg.a.substring(prefix.length).trim();

        if (!proc) {
            const args = input.split(" ");
            proc = child_process.spawn(args[0], args.slice(1));

            proc.stdout.on("data", d => {
                d = d.toString();
                console.log(d);
                cl.sendChat(d);
            });

            proc.stderr.on("data", d => {
                d = d.toString();
                console.log(d);
                cl.sendChat(`💀 ${d}`);
            });

            proc.on("close", code => {
                console.log("Process exited with code " + code);
                cl.sendChat("Process exited with code " + code);
                proc = undefined;
            });
        } else {
            proc.stdin.write(input + "\n");
        }
    } catch (err) {
        cl.sendChat(`💀 ${err}`);
    }
});
