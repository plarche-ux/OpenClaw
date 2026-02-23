# Brand Value Canvas - AI Brainstorm Feature Code
*Saved: February 22, 2026*

Here are the exact changes to make in `Canvas.tsx`. Three small additions:

## Change 1: Add the import at the top
Find this line:
```typescript
import { generateAnalysis } from '../services/geminiService';
```
Replace it with:
```typescript
import { generateAnalysis, generateCanvasContent } from '../services/geminiService';
```

## Change 2: Add the brainstorm state + function
Find this line:
```typescript
const [isAnalyzing, setIsAnalyzing] = useState(false);
```
Add these lines directly below it:
```typescript
const [isBrainstorming, setIsBrainstorming] = useState(false);

const handleBrainstorm = async () => {
  if (!brandName) return alert("Please enter a brand name first.");
  if (!window.confirm("AI Brainstorm will fill in the canvas based on your brand name and description. This will replace any existing entries. Continue?")) return;
  
  setIsBrainstorming(true);
  try {
    const result = await generateCanvasContent(brandName, description);
    if (result) {
      setCanvasState({
        needs: result.needs.map((item, i) => ({ id: `n${i}_${Date.now()}`, ...item })),
        pains: result.pains.map((item, i) => ({ id: `p${i}_${Date.now()}`, ...item })),
        desires: result.desires.map((item, i) => ({ id: `d${i}_${Date.now()}`, ...item })),
      });
    }
  } catch (error) {
    alert("AI Brainstorm failed. Please try again.");
  } finally {
    setIsBrainstorming(false);
  }
};
```

## Change 3: Add the button to the UI
Find the existing "Analyze Brand" button block (starts with `<button onClick={handleAnalyze}`). 
Add this new button directly before it:
```tsx
<button 
  onClick={handleBrainstorm} 
  disabled={isBrainstorming || !brandName} 
  className="flex items-center gap-2 bg-amber-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-amber-400 disabled:opacity-50 transition-all shadow-md border border-amber-500"
>
  {isBrainstorming ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
  {isBrainstorming ? 'Brainstorming...' : 'AI Brainstorm'}
</button>
```

## What this does:
* A new amber/gold "AI Brainstorm" button appears next to "Analyze Brand."
* User enters their brand name + target customer description, clicks the button.
* AI fills in all the canvas rows automatically as a starting point.
* User can then edit any row before clicking "Analyze Brand."