import React, { useState } from 'react';
import {
  Container,
  Grid,
  Section,
  Button,
  Input,
  Select,
  Textarea,
  Modal,
  Toast,
  Tag,
  Badge,
  Navbar,
  Footer,
  Breadcrumb,
  CodeBlock,
  MarkdownRenderer,
} from '../index';

const ComponentShowcase: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const sampleCode = `function hello() {
  console.log("Hello, World!");
  return "Welcome to the component library!";
}`;

  const sampleMarkdown = `# Welcome to the Component Library

This is a **comprehensive** collection of *accessible* components built with TypeScript and Tailwind CSS.

## Features

- Full accessibility support
- TypeScript definitions
- Motion-safe animations
- Responsive design

\`\`\`javascript
const example = "code block";
console.log(example);
\`\`\`

> This library provides everything you need for modern web development.`;

  return (
    <div className="min-h-screen bg-canvas-default">
      <Navbar
        brand={<div className="text-xl font-bold text-accent-fg">ComponentLib</div>}
        items={[
          { label: 'Home', isActive: true },
          { label: 'Components' },
          { label: 'Documentation' },
        ]}
        actions={
          <Button variant="outline" size="sm">
            Get Started
          </Button>
        }
      />

      <Container maxWidth="4xl" py="xl">
        <Section py="lg">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-fg-default mb-4">
              Component Library Showcase
            </h1>
            <p className="text-lg text-fg-muted max-w-2xl mx-auto">
              A comprehensive collection of accessible, typed, and responsive React components
            </p>
          </div>

          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: 'Components', href: '/components' },
              { label: 'Showcase', isCurrentPage: true },
            ]}
            className="mb-8"
          />

          <Grid columns={{ sm: 1, md: 2, lg: 3 }} gap="lg" className="mb-12">
            {/* Buttons */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-fg-default">Buttons</h3>
              <div className="space-x-2">
                <Button variant="primary" size="sm">Primary</Button>
                <Button variant="secondary" size="sm">Secondary</Button>
                <Button variant="outline" size="sm">Outline</Button>
              </div>
              <Button
                variant="primary"
                isFullWidth
                onClick={() => setIsModalOpen(true)}
              >
                Open Modal
              </Button>
            </div>

            {/* Form Components */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-fg-default">Forms</h3>
              <Input
                label="Email Address"
                type="email"
                placeholder="Enter your email"
                helperText="We'll never share your email"
              />
              <Select
                label="Choose Option"
                options={[
                  { value: 'option1', label: 'Option 1' },
                  { value: 'option2', label: 'Option 2' },
                  { value: 'option3', label: 'Option 3' },
                ]}
                placeholder="Select an option"
              />
              <Textarea
                label="Message"
                placeholder="Enter your message"
                rows={3}
              />
            </div>

            {/* Tags and Badges */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-fg-default">Tags & Badges</h3>
              <div className="flex flex-wrap gap-2">
                <Tag variant="accent">React</Tag>
                <Tag variant="success">TypeScript</Tag>
                <Tag variant="attention" isClosable onClose={() => {}}>
                  Closable
                </Tag>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-fg-default">Status:</span>
                <Badge variant="success">Active</Badge>
                <Badge variant="attention" size="sm">Beta</Badge>
                <Badge variant="danger" isDot />
              </div>
            </div>
          </Grid>

          {/* Code Block */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-fg-default mb-4">Code Block</h3>
            <CodeBlock
              code={sampleCode}
              language="javascript"
              filename="example.js"
              showLineNumbers
            />
          </div>

          {/* Markdown Renderer */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-fg-default mb-4">Markdown Content</h3>
            <div className="bg-canvas-subtle rounded-lg p-6">
              <MarkdownRenderer content={sampleMarkdown} />
            </div>
          </div>

          {/* Toast Trigger */}
          <div className="text-center">
            <Button
              variant="secondary"
              onClick={() => setShowToast(true)}
            >
              Show Toast Notification
            </Button>
          </div>
        </Section>
      </Container>

      <Footer
        copyright="© 2024 Component Library. Built with ❤️ and TypeScript."
        links={[
          { label: 'Documentation', href: '/docs' },
          { label: 'GitHub', href: 'https://github.com', isExternal: true },
          { label: 'License', href: '/license' },
        ]}
      />

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Example Modal"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-fg-default">
            This is an example modal with proper focus management and accessibility features.
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setIsModalOpen(false)}>
              Confirm
            </Button>
          </div>
        </div>
      </Modal>

      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-4 right-4 z-50">
          <Toast
            id="example-toast"
            type="success"
            title="Success!"
            message="This is an example toast notification."
            onClose={() => setShowToast(false)}
          />
        </div>
      )}
    </div>
  );
};

export default ComponentShowcase;
