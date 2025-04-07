import fs from 'fs';
import axios from 'axios';
import express from 'express';
import { createCanvas, loadImage, registerFont } from 'canvas';

const router = express.Router();

const fontUrl = 'https://files.catbox.moe/2m1c7i.ttf';
const outPathImage = '/tmp/welcome-image.png';
const outPathFont = '/tmp/font.ttf';

router.get('/welcome', async (req, res) => {
  const { background, icon, name, group, creator, members, description, iswelcome, text, theme } = req.query;

  try {
    const { data: fontData } = await axios.get(fontUrl, { responseType: 'arraybuffer' });
    fs.writeFileSync(outPathFont, Buffer.from(fontData));
    registerFont(outPathFont, { family: 'CustomFont' });

    const buffer = await createWelcomImage(background, icon, name, group, creator, members, description, iswelcome, text, theme);
    fs.writeFileSync(outPathImage, buffer);

    res.status(200)
      .set('Content-Type', 'image/png')
      .sendFile(outPathImage, (err) => {
        if (err) {
          console.error('Error sending file:', err);
          return res.status(500).json({
            status: false,
            message: 'حدث خطأ أثناء إرسال الملف.',
            error: err.message
          });
        }
        fs.unlinkSync(outPathFont);
        fs.unlinkSync(outPathImage);
      });

  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({
      status: false,
      message: 'حدث خطأ أثناء معالجة الطلب.',
      error: error.message
    });
  }
});

const usedRouterKeys = {
  tag: "Bot",
  description: "Create welcome images for users in WhatsApp groups.",
  query: { 
    background: "url image group", 
    icon: "url image user",
    name: "name user", 
    group: "name group", 
    creator: "Group creator name", 
    members: "Number of group members", 
    description: "Group description", 
    iswelcome: "welcome = true", 
    theme: "....",
    text: "additional text under welcome message"
  },
  limited: 2,
  status: true,
  price: "free"
};

export { usedRouterKeys };

export default router;



function getThemeColors(theme) {
  const themes = {
    light: {
      bg: '#ffffff',
      accent: '#2196f3',
      text: '#212121',
      shadow: 'rgba(0, 0, 0, 0.1)',
      gradient: 'linear-gradient(145deg, #ffffff, #f0f0f0)'
    },
    dark: {
      bg: '#121212',
      accent: '#bb86fc',
      text: '#e0e0e0',
      shadow: 'rgba(0, 0, 0, 0.6)',
      gradient: 'linear-gradient(145deg, #1e1e1e, #2c2c2c)'
    },
    terbo: {
  bg: '#0d1b2a',
  accent: '#1b263b',
  text: '#e0e1dd',
  shadow: 'rgba(0, 0, 0, 0.5)',
  gradient: 'linear-gradient(135deg, #0d1b2a, #1b263b)'
},
    neon: {
      bg: '#000000',
      accent: '#39ff14',
      text: '#ffffff',
      shadow: 'rgba(57, 255, 20, 0.4)',
      gradient: 'linear-gradient(145deg, #0f0f0f, #1a1a1a)'
    },
    ocean: {
      bg: '#e0f7fa',
      accent: '#00acc1',
      text: '#004d40',
      shadow: 'rgba(0, 172, 193, 0.3)',
      gradient: 'linear-gradient(145deg, #e0f7fa, #b2ebf2)'
    },
    forest: {
      bg: '#e8f5e9',
      accent: '#388e3c',
      text: '#1b5e20',
      shadow: 'rgba(56, 142, 60, 0.3)',
      gradient: 'linear-gradient(145deg, #e8f5e9, #c8e6c9)'
    },
    fire: {
      bg: '#fff3e0',
      accent: '#f57c00',
      text: '#e65100',
      shadow: 'rgba(245, 124, 0, 0.3)',
      gradient: 'linear-gradient(145deg, #fff3e0, #ffe0b2)'
    },
    old: {
      bg: '#fdf6e3',
      accent: '#b58900',
      text: '#657b83',
      shadow: 'rgba(101, 123, 131, 0.2)',
      gradient: 'linear-gradient(145deg, #fdf6e3, #eee8d5)'
    },
    rose: {
      bg: '#fff1f3',
      accent: '#f06292',
      text: '#880e4f',
      shadow: 'rgba(240, 98, 146, 0.3)',
      gradient: 'linear-gradient(145deg, #fff1f3, #fce4ec)'
    },
    nightSky: {
      bg: '#1a237e',
      accent: '#536dfe',
      text: '#e8eaf6',
      shadow: 'rgba(83, 109, 254, 0.4)',
      gradient: 'linear-gradient(145deg, #1a237e, #283593)'
    },
    sunset: {
      bg: '#ffecb3',
      accent: '#ff7043',
      text: '#bf360c',
      shadow: 'rgba(255, 112, 67, 0.3)',
      gradient: 'linear-gradient(145deg, #ffecb3, #ffe0b2)'
    },
    lavender: {
      bg: '#f3e5f5',
      accent: '#ab47bc',
      text: '#4a148c',
      shadow: 'rgba(171, 71, 188, 0.3)',
      gradient: 'linear-gradient(145deg, #f3e5f5, #e1bee7)'
    },
    cyberpunk: {
      bg: '#0f0f0f',
      accent: '#ff00ff',
      text: '#00ffff',
      shadow: 'rgba(255, 0, 255, 0.4)',
      gradient: 'linear-gradient(145deg, #0f0f0f, #1a1a1a)'
    },
    infernoBlack: {
  bg: '#0a0a0a',
  accent: '#ff1a1a',
  text: '#ffeaea',
  shadow: 'rgba(255, 26, 26, 0.3)',
  gradient: 'linear-gradient(145deg, #0a0a0a, #1a0000)',
},
flameShadow: {
  bg: '#121212',
  accent: '#ff4500',
  text: '#ffdad0',
  shadow: 'rgba(255, 69, 0, 0.25)',
  gradient: 'linear-gradient(145deg, #121212, #240000)',
},
blackLava: {
  bg: '#0f0f0f',
  accent: '#e60000',
  text: '#ffd6d6',
  shadow: 'rgba(230, 0, 0, 0.2)',
  gradient: 'linear-gradient(145deg, #0f0f0f, #1c0000)',
},
rubyAsh: {
  bg: '#101010',
  accent: '#ff0033',
  text: '#fff0f0',
  shadow: 'rgba(255, 0, 51, 0.25)',
  gradient: 'linear-gradient(145deg, #101010, #2b0008)',
},
darkGold: {
  bg: '#1b1b1b',
  accent: '#d4af37', // ذهب غامق
  text: '#f5f5dc',
  shadow: 'rgba(212, 175, 55, 0.3)',
  gradient: 'linear-gradient(145deg, #1b1b1b, #2c2c2c)',
},
goldNight: {
  bg: '#0f0f0f',
  accent: '#ffd700', // ذهبي لامع
  text: '#fff8dc',
  shadow: 'rgba(255, 215, 0, 0.25)',
  gradient: 'linear-gradient(145deg, #0f0f0f, #292929)',
},
royalBlack: {
  bg: '#121212',
  accent: '#e6c200', // ذهبي ملكي
  text: '#fff1c1',
  shadow: 'rgba(230, 194, 0, 0.3)',
  gradient: 'linear-gradient(145deg, #121212, #1e1e1e)',
},
darkGoldRed: {
  bg: '#0d0d0d', // أسود عميق
  accent: '#ff0000', // أحمر ناري
  text: '#f0f0f0', // نص رمادي فاتح
  highlight: '#d4af37', // ذهبي ملكي
  shadow: 'rgba(255, 0, 0, 0.25)',
  gradient: 'linear-gradient(135deg, #0d0d0d, #1a1a1a)',
},
royalDark: {
  bg: '#1a1a1a', // أسود محايد
  accent: '#ffd700', // ذهبي لامع
  text: '#ffffff', // أبيض نقي
  highlight: '#990000', // أحمر ملكي داكن
  shadow: 'rgba(212, 175, 55, 0.2)',
  gradient: 'linear-gradient(145deg, #1a1a1a, #2a2a2a)',
},
luxuryNight: {
  bg: '#121212', // أسود ليلي
  accent: '#b30000', // أحمر فاخر
  text: '#f8f8f8',
  highlight: '#f5c518', // ذهبي فاتح
  shadow: 'rgba(179, 0, 0, 0.2)',
  gradient: 'linear-gradient(145deg, #121212, #1e1e1e)',
},
obsidianFire: {
  bg: '#0a0a0a', // أسود حجري
  accent: '#e60000', // أحمر مشع
  text: '#eeeeee',
  highlight: '#ffc107', // ذهبي جذاب
  shadow: 'rgba(230, 0, 0, 0.3)',
  gradient: 'linear-gradient(145deg, #0a0a0a, #161616)',
},
glass: {
  bg: '#1a1a1a',
  accent: '#ffd700',
  text: '#ffffff',
  highlight: '#990000',
  shadow: 'rgba(212, 175, 55, 0.2)',
  gradient: 'linear-gradient(145deg, #1a1a1a, #2a2a2a)',
},

    custom: (customColors) => {
      return {
        bg: customColors.bg || '#1c1c1c',
        accent: customColors.accent || '#444',
        text: customColors.text || '#ffffff',
        shadow: customColors.shadow || 'rgba(0, 0, 0, 0.3)',
        gradient: customColors.gradient || 'linear-gradient(45deg, #ffffff, #f0f0f0)'
      };
    },
  };

  return themes[theme] || themes['darkGoldRed'];
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 5) {
  const words = text.split(' ');
  let line = '';
  let lines = [];

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      lines.push(line);
      line = words[n] + ' ';
      if (lines.length === maxLines - 1) break;
    } else {
      line = testLine;
    }
  }
  lines.push(line);

  if (lines.length === maxLines) {
    const lastLine = lines[maxLines - 1];
    const shortened = lastLine.trim().slice(0, -3);
    lines[maxLines - 1] = shortened + '...';
  }

  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], x, y + (i * lineHeight));
  }
}

async function createWelcomImage(backgroundUrl, avatarUrl, name, groupName, creatorName, members, description, iswelcome, text, theme = 'default') {
  const width = 900;
  const height = 1600;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  const { bg, accent, text: textColor, shadow, gradient } = getThemeColors(theme);

  const background = await loadImage(backgroundUrl);
  ctx.drawImage(background, 0, 0, width, 500);

  const gradientFill = ctx.createLinearGradient(0, 500, 0, 1000);
  gradientFill.addColorStop(0, bg);
  gradientFill.addColorStop(1, gradient || '#f0f0f0');
  ctx.fillStyle = gradientFill;
  ctx.fillRect(0, 500, width, 1100);

  const avatar = await loadImage(avatarUrl);
  const avatarSize = 200;
  const avatarX = width - avatarSize - 80;
  const avatarY = 520;

  ctx.save();
  ctx.shadowColor = shadow;
  ctx.shadowBlur = 15;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 4;
  ctx.beginPath();
  ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
  ctx.restore();

  ctx.font = 'bold 28px CustomFont';
  ctx.fillStyle = '#555';
  ctx.textAlign = 'left';
  ctx.fillText('User Name:', 80, 560);
  ctx.fillStyle = '#222';
  ctx.font = '24px CustomFont';
  ctx.fillText(name, 80, 595);

  ctx.font = 'bold 28px CustomFont';
  ctx.fillStyle = '#555';
  ctx.fillText('Group Name:', 80, 635);
  ctx.fillStyle = '#222';
  ctx.font = '24px CustomFont';
  ctx.fillText(groupName, 80, 670);

  ctx.font = 'bold 26px CustomFont';
  ctx.fillStyle = '#555';
  ctx.fillText('Members:', 80, 730);
  ctx.fillStyle = '#222';
  ctx.font = '24px CustomFont';
  ctx.fillText(`${members}`, 200, 730);

  ctx.font = 'bold 26px CustomFont';
  ctx.fillStyle = '#555';
  ctx.fillText('Description:', 80, 800);
  ctx.fillStyle = '#222';
  ctx.font = '22px CustomFont';
  wrapText(ctx, description, 80, 835, width - 160, 30);

  const welcomeText = iswelcome === 'true'
    ? `Welcome ${name} to ${groupName}!`
    : `${name} has left ${groupName}.`;

  const welcomeGradient = ctx.createLinearGradient(width / 2 - 150, 0, width / 2 + 150, 0);
  welcomeGradient.addColorStop(0, accent);
  welcomeGradient.addColorStop(1, '#fff');

  ctx.textAlign = 'center';
  ctx.fillStyle = welcomeGradient;
  ctx.font = 'bold 40px CustomFont';
  ctx.fillText(welcomeText, width / 2, 1100);

  if (text) {
    ctx.fillStyle = '#666';
    ctx.font = '24px CustomFont';
    ctx.fillText(text, width / 2, 1140);
  }

  ctx.fillStyle = '#888';
  ctx.font = 'italic 22px CustomFont';
  ctx.fillText(`Group created by ${creatorName}`, width / 2, height - 40);

  return canvas.toBuffer();
}
