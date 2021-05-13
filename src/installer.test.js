import { rmRF, } from '@actions/io';
import { join, } from 'path';
import { arch, } from 'os';

import { getGraalVM, } from './installer';

const CACHE_DIR = join(__dirname, '..', 'cache');
const TEMP_DIR  = join(__dirname, '..', 'temp');

process.env['RUNNER_TOOL_CACHE'] = CACHE_DIR;
process.env['RUNNER_TEMP']       = TEMP_DIR;

const safeDelete = async (dir) => {
    try {
        await rmRF(dir);
    } catch {
        console.error(`Failed to delete directory ${dir}`);
    }
};

describe('installer', () => {
    afterAll(async () => {
        await safeDelete(CACHE_DIR);
        await safeDelete(TEMP_DIR);
    });

    it('Installs GraalVM', async () => {
        const javaVersion    = 11;
        const graalvmVersion = '20.1.0';
        const options        = {
            tempDir  : TEMP_DIR,
            jvmDir   : join(TEMP_DIR, 'Library', 'Java', 'JavaVirtualMachines'),
            javaHome : 'TEST_JAVA_HOME',
        };

        const toolPath = await getGraalVM(javaVersion, graalvmVersion, options);

        if (process.platform === 'darwin') {
            expect(toolPath).toBe(join(CACHE_DIR, 'GraalVM', `java${javaVersion}-darwin-amd64-${graalvmVersion}`, arch()));
            expect(process.env[ options.javaHome ]).toBe(join(toolPath, '/Contents/Home'));
        } else if (process.platform === 'win32') {
            expect(toolPath).toBe(join(CACHE_DIR, 'GraalVM', `java${javaVersion}-windows-amd64-${graalvmVersion}`, arch()));
            expect(process.env[options.javaHome]).toBe(toolPath);
        } else if (process.arch === 'arm64') {
            expect(toolPath).toBe(join(CACHE_DIR, 'GraalVM', `java${javaVersion}-linux-aarch64-${graalvmVersion}`, arch()));
            expect(process.env[options.javaHome]).toBe(toolPath);
        } else {
            expect(toolPath).toBe(join(CACHE_DIR, 'GraalVM', `java${javaVersion}-linux-amd64-${graalvmVersion}`, arch()));
            expect(process.env[options.javaHome]).toBe(toolPath);
        }
    });
});
