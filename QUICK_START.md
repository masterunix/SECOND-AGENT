# Quick Start Guide

## 🚀 Get Running in 3 Steps

### Step 1: Install Dependencies
```bash
cd frontend
npm install
```

### Step 2: Start Backend
```bash
# In root directory (open new terminal)
python backend.py
```

### Step 3: Start Frontend
```bash
# In frontend directory
npm run dev
```

### Step 4: Open Browser
```
http://localhost:3000
```

That's it! 🎉

---

## 📋 Detailed Instructions

### Prerequisites
- ✅ Node.js v18+ installed
- ✅ Python 3.9+ installed
- ✅ Backend dependencies installed (`pip install -r requirements.txt`)

### First Time Setup

1. **Clone/Navigate to Project**
   ```bash
   cd /path/to/globalfreight-ai-platform
   ```

2. **Install Frontend Dependencies**
   ```bash
   cd frontend
   npm install
   ```
   
   This installs:
   - Next.js 15
   - React 19
   - TypeScript
   - Tailwind CSS
   - Framer Motion
   - Lucide React

3. **Verify Backend Setup**
   ```bash
   cd ..  # Back to root
   python backend.py
   ```
   
   Should see:
   ```
   * Running on http://127.0.0.1:5001
   ```

4. **Start Frontend (New Terminal)**
   ```bash
   cd frontend
   npm run dev
   ```
   
   Should see:
   ```
   ▲ Next.js 15.x.x
   - Local:        http://localhost:3000
   ```

5. **Open Browser**
   ```
   http://localhost:3000
   ```

---

## 🎯 What You'll See

### Initial Load
- ✅ Animated gradient background
- ✅ Header with "Connecting..." status
- ✅ Compact tab switcher (Level 1 active)
- ✅ Level 1: RAG Assistant interface

### After Backend Connects
- ✅ Status changes to "Online · v1.0"
- ✅ Green pulsing indicator
- ✅ Ready to use!

---

## 🧪 Testing the Application

### Test Level 1 (RAG Assistant)

1. **Click a sample query** or type your own:
   ```
   What's the transit time from Mumbai to Hamburg for a Platinum shipment?
   ```

2. **Watch for**:
   - Message appears in chat
   - Loading animation (3 dots)
   - Response from assistant
   - Smooth animations

### Test Level 2 (Exception Handler)

1. **Click "Level 2: Exception Handler" tab**
   - Smooth fade transition
   - Three-panel layout appears

2. **Click an event** in the left panel
   - Event highlights with glow
   - Details appear in center
   - Smooth animations

3. **Click "Process Event"**
   - Button shows loading state
   - Processing takes 10-40 seconds
   - Result appears below
   - Next event auto-selected

---

## 🎨 Visual Features to Notice

### Glass Effects
- Look at any card - notice the blur and depth
- Multiple shadow layers
- Gradient backgrounds
- Top highlight lines

### Animations
- Tab switching - smooth fade and slide
- Event selection - scale and glow
- Button hovers - lift and shadow
- Progress bar - shimmer effect

### Compact Design
- Tabs are 50% smaller than original
- More content visible
- Cleaner, modern look

---

## 🔧 Troubleshooting

### Backend Won't Start
```bash
# Check if port 5001 is in use
lsof -i :5001

# Kill process if needed
kill -9 <PID>

# Try again
python backend.py
```

### Frontend Won't Start
```bash
# Clear cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules
npm install

# Try again
npm run dev
```

### "Cannot connect to backend"
1. Verify backend is running: `http://localhost:5001/health`
2. Check `.env.local` has correct URL
3. Check browser console for CORS errors
4. Ensure backend has CORS enabled

### Animations Not Smooth
1. Check browser supports `backdrop-filter`
2. Try Chrome/Edge (best support)
3. Disable browser extensions
4. Check GPU acceleration is enabled

---

## 📱 Browser Support

### Recommended
- ✅ Chrome 90+
- ✅ Edge 90+
- ✅ Safari 15+
- ✅ Firefox 90+

### Features Requiring Modern Browser
- `backdrop-filter` (glass effects)
- CSS Grid
- Flexbox
- CSS Custom Properties

---

## 🎯 Quick Commands Reference

### Development
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npm run type-check   # Check TypeScript
```

### Backend
```bash
python backend.py    # Start backend
```

### Useful
```bash
# Check what's running on port 3000
lsof -i :3000

# Check what's running on port 5001
lsof -i :5001

# Kill a process
kill -9 <PID>
```

---

## 📊 Performance Tips

### For Best Experience
1. Use Chrome or Edge (best performance)
2. Close unnecessary browser tabs
3. Ensure good internet connection (for fonts)
4. Use hardware acceleration

### If Slow
1. Check CPU usage
2. Close other applications
3. Try production build: `npm run build && npm start`
4. Disable browser extensions

---

## 🎓 Learning the Codebase

### Start Here
1. `app/page.tsx` - Main page with tab switching
2. `components/Header.tsx` - Header component
3. `components/TabSwitcher.tsx` - Tab navigation
4. `components/GlassCard.tsx` - Reusable glass card

### Then Explore
1. `components/Level1/Level1.tsx` - RAG Assistant
2. `components/Level2/Level2.tsx` - Exception Handler
3. `tailwind.config.ts` - Custom utilities
4. `app/globals.css` - Global styles

---

## 🎨 Customization Quick Tips

### Change Colors
Edit `tailwind.config.ts`:
```typescript
colors: {
  neon: {
    green: '#00ff88',  // Change this
    blue: '#00d4ff',   // And this
  },
}
```

### Adjust Glass Effect
Edit `app/globals.css`:
```css
.glass {
  backdrop-filter: blur(30px);  /* Increase for more blur */
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.05) 0%,  /* Adjust opacity */
    rgba(255, 255, 255, 0.02) 100%
  );
}
```

### Change Animation Speed
Edit component:
```tsx
<motion.div
  transition={{ duration: 0.3 }}  // Adjust duration
>
```

---

## 📚 Documentation

- **Frontend Details**: `frontend/README.md`
- **Migration Guide**: `NEXTJS_MIGRATION_GUIDE.md`
- **Visual Comparison**: `VISUAL_COMPARISON.md`
- **Full Summary**: `NEXTJS_CONVERSION_SUMMARY.md`

---

## 🆘 Getting Help

### Check These First
1. Browser console for errors
2. Terminal for backend errors
3. Network tab for API calls
4. React DevTools for component state

### Common Issues
- **CORS errors**: Enable CORS in backend
- **404 errors**: Check backend is running
- **Blank page**: Check browser console
- **Slow animations**: Check GPU acceleration

---

## 🎉 Success Checklist

After starting, you should see:

- ✅ Animated gradient background
- ✅ Header with logo and status
- ✅ Status shows "Online" (green)
- ✅ Two compact tabs at top
- ✅ Level 1 interface with chat
- ✅ Sample queries clickable
- ✅ Smooth animations everywhere
- ✅ Glass effects on all cards
- ✅ Can switch between tabs smoothly

If all checked, you're good to go! 🚀

---

## 🔗 Quick Links

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5001
- **Backend Health**: http://localhost:5001/health
- **Next.js Docs**: https://nextjs.org/docs
- **Framer Motion**: https://www.framer.com/motion/
- **Tailwind CSS**: https://tailwindcss.com/docs

---

## 💡 Pro Tips

1. **Use keyboard shortcuts**: Cmd+K (Mac) or Ctrl+K (Windows) in VS Code
2. **Hot reload**: Changes appear instantly in browser
3. **React DevTools**: Install for better debugging
4. **Network throttling**: Test on slower connections
5. **Responsive design**: Resize browser to test layouts

---

## 🎯 Next Steps

Once running:

1. ✅ Test Level 1 with sample queries
2. ✅ Test Level 2 event processing
3. ✅ Explore the animations
4. ✅ Check the glass effects
5. ✅ Try different browsers
6. ✅ Read the documentation
7. ✅ Customize to your needs

Enjoy your enhanced GlobalFreight AI Platform! 🚀✨
