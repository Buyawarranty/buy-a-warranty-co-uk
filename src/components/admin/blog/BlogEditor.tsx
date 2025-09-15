import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Bold, Italic, Underline, Link, List, ListOrdered, Quote, Code, 
  Image, Video, Save, Eye, Clock, Undo, Redo, Type, Heading1, 
  Heading2, Heading3, AlignLeft, AlignCenter, AlignRight
} from 'lucide-react';

export const BlogEditor = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [isMarkdown, setIsMarkdown] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [readTime, setReadTime] = useState(0);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    const words = content.split(' ').filter(word => word.length > 0).length;
    setWordCount(words);
    setReadTime(Math.ceil(words / 200)); // Average reading speed
  }, [content]);

  const handleAutoSave = () => {
    // Auto-save functionality would go here
    setLastSaved(new Date());
  };

  useEffect(() => {
    const interval = setInterval(handleAutoSave, 30000); // Auto-save every 30 seconds
    return () => clearInterval(interval);
  }, [content, title]);

  const formatText = (format: string) => {
    // Text formatting functionality would go here
    console.log(`Formatting text with: ${format}`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Smart Blog Editor</CardTitle>
              <CardDescription>Write and format your content with professional tools</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant={isMarkdown ? "default" : "outline"} 
                size="sm"
                onClick={() => setIsMarkdown(!isMarkdown)}
              >
                {isMarkdown ? 'Markdown' : 'WYSIWYG'}
              </Button>
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button variant="default" size="sm">
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Article Title */}
          <div>
            <label className="block text-sm font-medium mb-2">Article Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your article title..."
              className="text-lg font-semibold"
            />
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-medium mb-2">Excerpt</label>
            <Textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Write a compelling excerpt that summarizes your article..."
              rows={3}
            />
          </div>

          <Separator />

          {/* Formatting Toolbar */}
          <div className="border rounded-lg p-3 bg-gray-50">
            <div className="flex items-center gap-1 flex-wrap">
              <div className="flex items-center gap-1 mr-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => formatText('undo')}
                  className="p-2"
                >
                  <Undo className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => formatText('redo')}
                  className="p-2"
                >
                  <Redo className="w-4 h-4" />
                </Button>
              </div>

              <Separator orientation="vertical" className="h-6 mx-2" />

              <div className="flex items-center gap-1 mr-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => formatText('h1')}
                  className="p-2"
                >
                  <Heading1 className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => formatText('h2')}
                  className="p-2"
                >
                  <Heading2 className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => formatText('h3')}
                  className="p-2"
                >
                  <Heading3 className="w-4 h-4" />
                </Button>
              </div>

              <Separator orientation="vertical" className="h-6 mx-2" />

              <div className="flex items-center gap-1 mr-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => formatText('bold')}
                  className="p-2"
                >
                  <Bold className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => formatText('italic')}
                  className="p-2"
                >
                  <Italic className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => formatText('underline')}
                  className="p-2"
                >
                  <Underline className="w-4 h-4" />
                </Button>
              </div>

              <Separator orientation="vertical" className="h-6 mx-2" />

              <div className="flex items-center gap-1 mr-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => formatText('alignLeft')}
                  className="p-2"
                >
                  <AlignLeft className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => formatText('alignCenter')}
                  className="p-2"
                >
                  <AlignCenter className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => formatText('alignRight')}
                  className="p-2"
                >
                  <AlignRight className="w-4 h-4" />
                </Button>
              </div>

              <Separator orientation="vertical" className="h-6 mx-2" />

              <div className="flex items-center gap-1 mr-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => formatText('ul')}
                  className="p-2"
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => formatText('ol')}
                  className="p-2"
                >
                  <ListOrdered className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => formatText('quote')}
                  className="p-2"
                >
                  <Quote className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => formatText('code')}
                  className="p-2"
                >
                  <Code className="w-4 h-4" />
                </Button>
              </div>

              <Separator orientation="vertical" className="h-6 mx-2" />

              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => formatText('link')}
                  className="p-2"
                >
                  <Link className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => formatText('image')}
                  className="p-2"
                >
                  <Image className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => formatText('video')}
                  className="p-2"
                >
                  <Video className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content Editor */}
          <div>
            <label className="block text-sm font-medium mb-2">Content</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={isMarkdown ? 
                "Write your content in Markdown...\n\n# Main Heading\n\n## Subheading\n\n**Bold text** and *italic text*\n\n- Bullet point 1\n- Bullet point 2\n\n[Link text](https://example.com)" :
                "Start writing your article content here..."
              }
              rows={20}
              className="font-mono text-sm"
            />
          </div>

          {/* Editor Stats */}
          <div className="flex items-center justify-between text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center gap-6">
              <span>Words: {wordCount}</span>
              <span>Reading time: {readTime} min</span>
              <span>Characters: {content.length}</span>
            </div>
            <div className="flex items-center gap-2">
              {lastSaved && (
                <>
                  <Clock className="w-4 h-4" />
                  <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
                </>
              )}
              <Badge variant="outline" className="bg-green-50 text-green-700">
                Auto-save enabled
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};