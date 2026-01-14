const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, 'src', 'assets');
const images = [
    { name: 'langingPageBg.png', quality: 75 },
    { name: 'visage_blonde.png', quality: 80 },
    { name: 'body_fit.png', quality: 80 },
    { name: 'skin_glow.png', quality: 80 },
    { name: 'dr_moon_logo_white.png', quality: 85 }
];

async function compressImages() {
    console.log('Starting image compression...\n');

    for (const image of images) {
        const inputPath = path.join(assetsDir, image.name);
        const backupPath = path.join(assetsDir, `${image.name}.backup`);

        if (!fs.existsSync(inputPath)) {
            console.log(`⚠️  Skipped: ${image.name} (not found)`);
            continue;
        }

        if (!fs.existsSync(backupPath)) {
            fs.copyFileSync(inputPath, backupPath);
            console.log(`💾 Backed up: ${image.name}`);
        }

        const originalStats = fs.statSync(inputPath);
        const originalSizeKB = (originalStats.size / 1024).toFixed(2);

        await sharp(inputPath)
            .png({
                quality: image.quality,
                compressionLevel: 9,
                effort: 10
            })
            .toFile(inputPath + '.compressed');

        const compressedStats = fs.statSync(inputPath + '.compressed');
        const compressedSizeKB = (compressedStats.size / 1024).toFixed(2);
        const reduction = ((1 - compressedStats.size / originalStats.size) * 100).toFixed(1);

        fs.renameSync(inputPath + '.compressed', inputPath);

        console.log(`✅ ${image.name}: ${originalSizeKB} KB → ${compressedSizeKB} KB (-${reduction}%)`);
    }

    console.log('\n✅ All images compressed successfully!');
}

compressImages().catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});
