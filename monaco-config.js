/**
 * Monaco Editor Configuration and Optimization
 * Handles all Monaco Editor settings, initialization, and performance optimizations
 */

class MonacoEditorManager {
    constructor() {
        this.editor = null;
        this.isInitialized = false;
        this.resizeObserver = null;
        this.currentTheme = 'vs-dark';
        this.config = this.getOptimizedConfig();
    }

    /**
     * Get optimized Monaco Editor configuration for JavaScript development
     */
    getOptimizedConfig() {
        return {
            // Core JavaScript settings
            language: 'javascript',
            theme: this.currentTheme,
            value: '// JavaScript code editor ready...',

            // Disable automatic layout - we'll handle this manually
            automaticLayout: false,

            // Minimal scrolling - disable Monaco's internal scrolling
            scrollBeyondLastLine: false,
            scrollBeyondLastColumn: 0,
            smoothScrolling: false,
            mouseWheelScrollSensitivity: 0, // Disable Monaco scroll
            fastScrollSensitivity: 0,
            scrollbar: {
                vertical: 'hidden',
                horizontal: 'hidden',
                useShadows: false,
                verticalHasArrows: false,
                horizontalHasArrows: false,
                verticalScrollbarSize: 0,
                horizontalScrollbarSize: 0,
                arrowSize: 0,
                alwaysConsumeMouseWheel: false
            },

            // Enhanced JavaScript-friendly display settings
            fontSize: 14,
            lineHeight: 1.4,
            letterSpacing: 0,
            fontFamily: "'JetBrains Mono', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', monospace",
            fontLigatures: true, // Enable for better JavaScript readability
            renderLineHighlight: 'all', // Highlight current line for better focus
            renderWhitespace: 'selection', // Show whitespace in selections
            renderControlCharacters: false,
            renderIndentGuides: true, // Essential for JavaScript block structure
            renderValidationDecorations: 'on', // Show syntax errors

            // Disable minimap but keep useful features
            minimap: {
                enabled: false
            },

            // Enhanced line numbers and navigation
            lineNumbers: 'on',
            lineNumbersMinChars: 4,
            lineDecorationsWidth: 10,
            folding: true, // Enable code folding for JavaScript functions/objects
            foldingStrategy: 'indentation',
            foldingHighlight: true,
            showFoldingControls: 'mouseover',

            // Smart word wrapping for JavaScript
            wordWrap: 'on',
            wordWrapColumn: 120,
            wordWrapMinified: true,
            wrappingIndent: 'indent',

            // Enhanced cursor and selection for coding
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: true,
            cursorStyle: 'line',
            cursorWidth: 2,
            selectOnLineNumbers: true,
            selectionHighlight: true, // Highlight matching selections
            occurrencesHighlight: true, // Highlight variable occurrences
            roundedSelection: true,
            multiCursorModifier: 'alt',

            // Enhanced IntelliSense and autocomplete for JavaScript
            quickSuggestions: {
                other: true,
                comments: false,
                strings: true
            },
            quickSuggestionsDelay: 100,
            suggestOnTriggerCharacters: true,
            acceptSuggestionOnCommitCharacter: true,
            acceptSuggestionOnEnter: 'on',
            tabCompletion: 'on',
            parameterHints: {
                enabled: true,
                cycle: true
            },
            suggestSelection: 'recentlyUsed',

            // Enhanced hover information for JavaScript
            hover: {
                enabled: true,
                delay: 300,
                sticky: true
            },
            lightbulb: {
                enabled: true
            },

            // JavaScript-optimized formatting
            formatOnType: true, // Auto-format while typing
            formatOnPaste: true, // Auto-format on paste
            autoIndent: 'full', // Smart indentation
            insertSpaces: true,
            tabSize: 2, // Standard JavaScript indentation
            detectIndentation: true,
            trimAutoWhitespace: true,

            // Enhanced bracket features for JavaScript
            bracketPairColorization: {
                enabled: true,
                independentColorPoolPerBracketType: true
            },
            guides: {
                bracketPairs: true,
                bracketPairsHorizontal: 'active',
                highlightActiveBracketPair: true,
                indentation: true,
                highlightActiveIndentation: true
            },
            matchBrackets: 'always',
            autoClosingBrackets: 'languageDefined',
            autoClosingQuotes: 'languageDefined',
            autoSurround: 'languageDefined',

            // Enhanced interaction features
            contextmenu: true,
            links: true,
            dragAndDrop: true,
            copyWithSyntaxHighlighting: true,
            emptySelectionClipboard: true,
            find: {
                seedSearchStringFromSelection: 'selection',
                autoFindInSelection: 'multiline',
                globalFindClipboard: true,
                addExtraSpaceOnTop: false,
                loop: true
            },

            // Enhanced features for JavaScript development
            codeLens: true, // Show function references and implementations
            colorDecorators: true, // Show color previews
            definitionLinkOpensInPeek: false,
            gotoLocation: {
                multipleReferences: 'peek',
                multipleDefinitions: 'peek',
                multipleDeclarations: 'peek',
                multipleImplementations: 'peek',
                multipleTypeDefinitions: 'peek'
            },

            // Accessibility support
            accessibilitySupport: 'auto',
            accessibilityPageSize: 10,

            // Performance settings - balanced for development
            stopRenderingLineAfter: 10000, // Higher limit for long files
            viewportColumn: 40,
            disableLayerHinting: false, // Keep for better rendering
            disableMonospaceOptimizations: false,
            hideCursorInOverviewRuler: false,
            overviewRulerBorder: true,
            overviewRulerLanes: 3,

            // Enable proper editing
            readOnly: false,
            domReadOnly: false,

            // Enhanced rendering for JavaScript
            renderFinalNewline: true,
            renderLineHighlightOnlyWhenFocus: false,

            // Performance optimizations
            experimental: {
                useNewRendering: true // Use newer, faster rendering
            },

            // Additional JavaScript-specific features
            semanticHighlighting: {
                enabled: true
            },
            unicodeHighlight: {
                ambiguousCharacters: true,
                invisibleCharacters: true
            },

            // Enhanced editing experience
            stickyScroll: {
                enabled: true
            },
            inlineSuggest: {
                enabled: true
            },
            suggest: {
                preview: true,
                showIcons: true,
                showStatusBar: true,
                filterGraceful: true,
                localityBonus: true,
                shareSuggestSelections: true,
                snippetsPreventQuickSuggestions: false,
                showInlineDetails: true
            }
        };
    }

    /**
     * Initialize Monaco Editor with minimal features and outer scrolling
     */
    async initialize() {
        try {
            console.log('🎯 Initializing minimal Monaco Editor with outer scrolling...');

            const container = document.getElementById('monaco-editor');
            if (!container) {
                throw new Error('Monaco editor container not found');
            }

            // Set up outer scroll container
            this.setupOuterScrollContainer();

            // Ensure container has proper dimensions
            this.ensureContainerDimensions(container);

            // Create editor instance with minimal config
            this.editor = monaco.editor.create(container, this.config);

            // Disable Monaco's internal scrolling completely
            this.disableInternalScrolling();

            // Set up manual layout management
            this.setupManualLayout();

            // Set up JavaScript-optimized event listeners
            this.setupJavaScriptEventListeners();

            // Configure JavaScript language features
            this.configureJavaScriptLanguage();

            // Load initial template
            this.loadInitialTemplate();

            // Enable performance monitoring
            this.setupPerformanceMonitoring();

            this.isInitialized = true;
            console.log('✅ JavaScript-optimized Monaco Editor initialized successfully');

            return this.editor;

        } catch (error) {
            console.error('❌ Failed to initialize Monaco Editor:', error);
            throw error;
        }
    }

    /**
     * Configure JavaScript language-specific features
     */
    async configureJavaScriptLanguage() {
        if (!this.editor) return;

        // Configure JavaScript language service
        monaco.languages.javascript.javascriptDefaults.setDiagnosticsOptions({
            noSemanticValidation: false,
            noSyntaxValidation: false,
            onlyVisible: true // Performance optimization - only validate visible code
        });

        // Set JavaScript compiler options for better IntelliSense
        monaco.languages.javascript.javascriptDefaults.setCompilerOptions({
            target: monaco.languages.javascript.ScriptTarget.ES2020,
            allowNonTsExtensions: true,
            moduleResolution: monaco.languages.javascript.ModuleResolutionKind.NodeJs,
            module: monaco.languages.javascript.ModuleKind.ES2015,
            noEmit: true,
            allowJs: true,
            checkJs: false, // Disable for performance
            strict: false,
            esModuleInterop: true,
            skipLibCheck: true, // Performance optimization
            typeRoots: []
        });

        // Add common JavaScript libraries for better autocomplete
        this.addJavaScriptLibraries();

        // Register JavaScript snippets
        this.registerJavaScriptSnippets();

        // Add custom commands
        this.registerCustomCommands();

        console.log('✅ JavaScript language features configured');
    }

    /**
     * Register useful JavaScript snippets
     */
    registerJavaScriptSnippets() {
        monaco.languages.registerCompletionItemProvider('javascript', {
            provideCompletionItems: (model, position) => {
                const suggestions = [
                    {
                        label: 'log',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: 'console.log(${1:object});',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: 'Console log statement',
                        range: {
                            startLineNumber: position.lineNumber,
                            endLineNumber: position.lineNumber,
                            startColumn: position.column,
                            endColumn: position.column
                        }
                    },
                    {
                        label: 'func',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: 'function ${1:functionName}(${2:parameters}) {\n\t${3:// TODO: implement}\n\treturn ${4:undefined};\n}',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: 'Function declaration',
                        range: {
                            startLineNumber: position.lineNumber,
                            endLineNumber: position.lineNumber,
                            startColumn: position.column,
                            endColumn: position.column
                        }
                    },
                    {
                        label: 'arrow',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: 'const ${1:functionName} = (${2:parameters}) => {\n\t${3:// TODO: implement}\n\treturn ${4:undefined};\n};',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: 'Arrow function',
                        range: {
                            startLineNumber: position.lineNumber,
                            endLineNumber: position.lineNumber,
                            startColumn: position.column,
                            endColumn: position.column
                        }
                    },
                    {
                        label: 'tryc',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: 'try {\n\t${1:// TODO: implement}\n} catch (${2:error}) {\n\tconsole.error(${2:error});\n\t${3:// Handle error}\n}',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: 'Try-catch block',
                        range: {
                            startLineNumber: position.lineNumber,
                            endLineNumber: position.lineNumber,
                            startColumn: position.column,
                            endColumn: position.column
                        }
                    },
                    {
                        label: 'async',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: 'async function ${1:functionName}(${2:parameters}) {\n\ttry {\n\t\t${3:// TODO: implement}\n\t\treturn ${4:result};\n\t} catch (error) {\n\t\tconsole.error(error);\n\t\tthrow error;\n\t}\n}',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: 'Async function with error handling',
                        range: {
                            startLineNumber: position.lineNumber,
                            endLineNumber: position.lineNumber,
                            startColumn: position.column,
                            endColumn: position.column
                        }
                    },
                    {
                        label: 'class',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: 'class ${1:ClassName} {\n\tconstructor(${2:parameters}) {\n\t\t${3:// Initialize properties}\n\t}\n\n\t${4:// Add methods here}\n}',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: 'Class declaration',
                        range: {
                            startLineNumber: position.lineNumber,
                            endLineNumber: position.lineNumber,
                            startColumn: position.column,
                            endColumn: position.column
                        }
                    }
                ];

                return { suggestions };
            }
        });

        console.log('✅ JavaScript snippets registered');
    }

    /**
     * Register custom commands for enhanced JavaScript development
     */
    registerCustomCommands() {
        // Add command to toggle line comments
        this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Slash, () => {
            this.editor.trigger('editor', 'editor.action.commentLine', {});
        });

        // Add command to duplicate line
        this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyD, () => {
            this.editor.trigger('editor', 'editor.action.copyLinesDownAction', {});
        });

        // Add command to move line up
        this.editor.addCommand(monaco.KeyMod.Alt | monaco.KeyCode.UpArrow, () => {
            this.editor.trigger('editor', 'editor.action.moveLinesUpAction', {});
        });

        // Add command to move line down
        this.editor.addCommand(monaco.KeyMod.Alt | monaco.KeyCode.DownArrow, () => {
            this.editor.trigger('editor', 'editor.action.moveLinesDownAction', {});
        });

        // Add command to select all occurrences of current word
        this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyL, () => {
            this.editor.trigger('editor', 'editor.action.selectHighlights', {});
        });

        console.log('✅ Custom JavaScript commands registered');
    }

    /**
     * Add common JavaScript libraries for autocomplete
     */
    addJavaScriptLibraries() {
        // Add ES2020+ features
        const es2020Types = `
declare global {
    interface Array<T> {
        flat(depth?: number): any[];
        flatMap<U>(callback: (value: T, index: number, array: T[]) => U | U[]): U[];
    }
    interface String {
        matchAll(regexp: RegExp): IterableIterator<RegExpMatchArray>;
        replaceAll(searchValue: string | RegExp, replaceValue: string): string;
    }
    interface Promise<T> {
        finally(onfinally?: (() => void) | undefined | null): Promise<T>;
    }
    const BigInt: (value?: any) => bigint;
    interface ObjectConstructor {
        fromEntries<T = any>(entries: Iterable<readonly [PropertyKey, T]>): { [k: string]: T };
    }
}`;

        // Add DOM types for web development
        const domTypes = `
declare const document: Document;
declare const window: Window;
declare const console: Console;
declare const localStorage: Storage;
declare const sessionStorage: Storage;
declare const fetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>;`;

        // Add these as extra libraries (only in development mode for performance)
        if (this.isDevelopmentMode()) {
            monaco.languages.javascript.javascriptDefaults.addExtraLib(es2020Types, 'es2020.d.ts');
            monaco.languages.javascript.javascriptDefaults.addExtraLib(domTypes, 'dom.d.ts');
        }
    }

    /**
     * Check if we're in development mode
     */
    isDevelopmentMode() {
        return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    }

    /**
     * Setup performance monitoring
     */
    setupPerformanceMonitoring() {
        if (!this.editor) return;

        // Monitor performance metrics
        let renderTime = 0;
        let lastRender = Date.now();

        this.editor.onDidChangeModelContent(() => {
            const now = Date.now();
            renderTime = now - lastRender;
            lastRender = now;

            // Log performance warnings only in development
            if (this.isDevelopmentMode() && renderTime > 100) {
                console.warn(`⚠️ Monaco render took ${renderTime}ms - consider optimizing content`);
            }
        });

        console.log('✅ Performance monitoring enabled');
    }

    /**
     * Set up outer scroll container
     */
    setupOuterScrollContainer() {
        const scrollContainer = document.querySelector('.editor-scroll-container');
        if (!scrollContainer) {
            console.warn('Outer scroll container not found');
            return;
        }

        // Ensure smooth scrolling on the outer container
        scrollContainer.style.scrollBehavior = 'smooth';

        console.log('✅ Outer scroll container configured');
    }

    /**
     * Disable Monaco's internal scrolling completely
     */
    disableInternalScrolling() {
        if (!this.editor) return;

        // Disable all scroll-related features
        this.editor.updateOptions({
            scrollbar: {
                vertical: 'hidden',
                horizontal: 'hidden',
                useShadows: false,
                verticalScrollbarSize: 0,
                horizontalScrollbarSize: 0,
                alwaysConsumeMouseWheel: false
            },
            mouseWheelScrollSensitivity: 0,
            fastScrollSensitivity: 0,
            scrollBeyondLastLine: false,
            scrollBeyondLastColumn: 0
        });

        console.log('✅ Monaco internal scrolling disabled');
    }

    /**
     * Get line height safely with fallbacks
     */
    getLineHeightSafe() {
        let lineHeight = 20; // Default fallback

        if (!this.editor) return lineHeight;

        try {
            // Try multiple methods to get line height
            const options = this.editor.getOptions();
            if (options) {
                // Try modern Monaco API
                if (typeof monaco !== 'undefined' && monaco.editor && monaco.editor.EditorOption) {
                    lineHeight = options.get(monaco.editor.EditorOption.lineHeight);
                }

                // Fallback to numeric option ID
                if (!lineHeight || isNaN(lineHeight)) {
                    lineHeight = options.get(51);
                }

                // Fallback to configuration
                if (!lineHeight || isNaN(lineHeight)) {
                    lineHeight = this.config.lineHeight * this.config.fontSize || 20;
                }
            }
        } catch (e) {
            console.warn('Error getting line height:', e);
        }

        // Final validation
        if (isNaN(lineHeight) || lineHeight <= 0) {
            lineHeight = 20;
        }

        return lineHeight;
    }

    /**
     * Set up manual layout management with dynamic height
     */
    setupManualLayout() {
        if (!this.editor) return;

        // Auto-resize based on content
        this.setupContentBasedResize();

        // Manual resize handling
        window.addEventListener('resize', () => {
            if (this.editor) {
                this.updateDynamicHeight();
                this.editor.layout();
            }
        });

        console.log('✅ Dynamic layout management configured');
    }

    /**
     * Set up content-based resizing
     */
    setupContentBasedResize() {
        if (!this.editor) return;

        // Content change handling for dynamic height
        let layoutTimeout;
        this.editor.onDidChangeModelContent(() => {
            clearTimeout(layoutTimeout);
            layoutTimeout = setTimeout(() => {
                this.updateDynamicHeight();
            }, 100);
        });

        // Initial height calculation - wait for Monaco to be fully ready
        setTimeout(() => {
            // Double-check that Monaco is ready before calculating height
            if (this.editor && this.editor.getModel()) {
                this.updateDynamicHeight();
            } else {
                // Retry after another delay
                setTimeout(() => {
                    if (this.editor && this.editor.getModel()) {
                        this.updateDynamicHeight();
                    }
                }, 1000);
            }
        }, 500);
    }

    /**
     * Update editor height based on content - Safe version
     */
    updateDynamicHeight() {
        if (!this.editor) return;

        const model = this.editor.getModel();
        if (!model) return;

        const lineCount = model.getLineCount();
        const lineHeight = this.getLineHeightSafe();

        // Calculate content height with some padding
        const contentHeight = Math.max(
            Math.ceil(lineCount * lineHeight) + 40, // Content height + padding
            150 // Minimum height
        );

        // Maximum height to prevent excessive scrolling
        const maxHeight = Math.min(contentHeight, 500);

        // Update container heights
        const editorWrapper = document.getElementById('monaco-editor');
        const scrollContainer = document.querySelector('.editor-scroll-container');

        if (editorWrapper && scrollContainer) {
            // Ensure values are valid before setting
            if (!isNaN(contentHeight) && contentHeight > 0) {
                editorWrapper.style.height = contentHeight + 'px';
            }
            if (!isNaN(maxHeight) && maxHeight > 0) {
                scrollContainer.style.height = maxHeight + 'px';
            }

            // Trigger layout update
            try {
                this.editor.layout({
                    width: editorWrapper.offsetWidth,
                    height: contentHeight
                });
            } catch (e) {
                console.warn('Layout update failed:', e);
            }
        }

        console.log(`📏 Dynamic height updated: ${contentHeight}px (${lineCount} lines, ${lineHeight}px line height)`);
    }    /**
     * Set up JavaScript-optimized event listeners with enhanced features
     */
    setupJavaScriptEventListeners() {
        if (!this.editor) return;

        // Content change listener with smart debouncing
        let contentChangeTimeout;
        this.editor.onDidChangeModelContent((e) => {
            clearTimeout(contentChangeTimeout);
            contentChangeTimeout = setTimeout(() => {
                // Update script info if available
                if (window.updateScriptInfo) {
                    window.updateScriptInfo();
                }
                // Update dynamic height
                this.updateDynamicHeight();

                // Auto-format JavaScript code if substantial changes
                if (e.changes.length > 0 && this.shouldAutoFormat(e)) {
                    this.formatCode();
                }
            }, 300);
        });

        // Enhanced cursor position listener for JavaScript
        this.editor.onDidChangeCursorPosition((e) => {
            // Show parameter hints when cursor is in function call
            if (this.isInFunctionCall(e.position)) {
                this.editor.trigger('editor', 'editor.action.triggerParameterHints', {});
            }
        });

        // Auto-suggestion on specific JavaScript triggers
        this.editor.onDidType((text) => {
            if (['.', '(', '['].includes(text)) {
                setTimeout(() => {
                    this.editor.trigger('editor', 'editor.action.triggerSuggest', {});
                }, 100);
            }
        });

        // Bracket matching and auto-completion
        this.editor.onKeyDown((e) => {
            this.handleJavaScriptKeyDown(e);
        });

        console.log('✅ JavaScript-optimized event listeners configured');
    }

    /**
     * Determine if code should be auto-formatted based on changes
     */
    shouldAutoFormat(changeEvent) {
        const changes = changeEvent.changes;

        // Auto-format on paste or when adding closing braces/parentheses
        for (const change of changes) {
            if (change.text.includes('\n') ||
                change.text.includes('}') ||
                change.text.includes(');') ||
                change.text.length > 50) {
                return true;
            }
        }
        return false;
    }

    /**
     * Check if cursor is within a function call
     */
    isInFunctionCall(position) {
        const model = this.editor.getModel();
        if (!model) return false;

        const lineContent = model.getLineContent(position.lineNumber);
        const beforeCursor = lineContent.substring(0, position.column - 1);

        // Simple heuristic: check for function call pattern
        return /\w+\s*\($/.test(beforeCursor) || /\w+\s*\([^)]*$/.test(beforeCursor);
    }

    /**
     * Handle JavaScript-specific key combinations
     */
    handleJavaScriptKeyDown(e) {
        // Auto-complete common JavaScript patterns
        if (e.ctrlKey && e.keyCode === 32) { // Ctrl+Space
            this.editor.trigger('editor', 'editor.action.triggerSuggest', {});
        }

        // Auto-format with Ctrl+Shift+F
        if (e.ctrlKey && e.shiftKey && e.keyCode === 70) { // Ctrl+Shift+F
            e.preventDefault();
            this.formatCode();
        }

        // Quick comment toggle with Ctrl+/
        if (e.ctrlKey && e.keyCode === 191) { // Ctrl+/
            e.preventDefault();
            this.editor.trigger('editor', 'editor.action.commentLine', {});
        }
    }

    /**
     * Format JavaScript code
     */
    async formatCode() {
        if (!this.editor) return;

        try {
            await this.editor.getAction('editor.action.formatDocument').run();
            console.log('✅ Code formatted successfully');
        } catch (error) {
            console.warn('⚠️ Auto-format failed:', error.message);
        }
    }

    /**
     * Ensure container has proper dimensions for scroll optimization
     */
    ensureContainerDimensions(container) {
        const computedStyle = window.getComputedStyle(container);

        // Only set dimensions if they're not already set
        if (computedStyle.height === '0px' || computedStyle.height === 'auto') {
            container.style.height = '500px';
        }

        if (computedStyle.width === '0px' || computedStyle.width === 'auto') {
            container.style.width = '100%';
        }

        // Remove any overflow restrictions that might prevent scrolling
        container.style.overflow = 'visible';
    }

    /**
     * Configure JavaScript/TypeScript language features
     */
    configureLanguageFeatures() {
        // JavaScript/TypeScript compiler options
        monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
            target: monaco.languages.typescript.ScriptTarget.ESNext,
            allowNonTsExtensions: true,
            allowJs: true,
            checkJs: false,
            noSemanticValidation: false,
            noSyntaxValidation: false,
            lib: ['es2020', 'dom', 'dom.iterable']
        });

        // Diagnostic options
        monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
            noSemanticValidation: false,
            noSyntaxValidation: false,
            noSuggestionDiagnostics: false,
            diagnosticCodesToIgnore: [1108, 1005] // Ignore some common warnings
        });

        // Add common web APIs and debugging context
        this.addDebuggingTypeDefinitions();
    }

    /**
     * Add type definitions for debugging context
     */
    addDebuggingTypeDefinitions() {
        const debuggingTypes = `
      // Debugging Context Types
      declare global {
        interface Window {
          DEBUG_MODE: any;
          SCRIPT_TEMPLATES: any;
          monacoEditor: any;
        }
        
        // Common debugging functions
        function sendMessage(message: any): void;
        function updateCommandOutput(output: string, type?: string): void;
        function addOutputLine(type: string, message: string): void;
        
        // Console methods
        interface Console {
          log(...args: any[]): void;
          error(...args: any[]): void;
          warn(...args: any[]): void;
          info(...args: any[]): void;
          debug(...args: any[]): void;
          trace(...args: any[]): void;
          assert(condition: boolean, ...args: any[]): void;
          clear(): void;
          count(label?: string): void;
          countReset(label?: string): void;
          dir(obj: any): void;
          dirxml(obj: any): void;
          group(label?: string): void;
          groupCollapsed(label?: string): void;
          groupEnd(): void;
          table(data: any): void;
          time(label?: string): void;
          timeEnd(label?: string): void;
          timeLog(label?: string, ...args: any[]): void;
        }
      }
    `;

        monaco.languages.typescript.javascriptDefaults.addExtraLib(
            debuggingTypes,
            'debugging-context.d.ts'
        );
    }

    /**
     * Set up event listeners for editor optimization
     */
    setupEventListeners() {
        if (!this.editor) return;

        // Content change listener with debouncing
        let contentChangeTimeout;
        this.editor.onDidChangeModelContent(() => {
            clearTimeout(contentChangeTimeout);
            contentChangeTimeout = setTimeout(() => {
                if (window.updateScriptInfo) {
                    window.updateScriptInfo();
                }
            }, 300); // Debounce to improve performance
        });

        // Cursor position change listener with throttling
        let cursorChangeTimeout;
        this.editor.onDidChangeCursorPosition((e) => {
            // Throttle cursor position updates to improve performance
            clearTimeout(cursorChangeTimeout);
            cursorChangeTimeout = setTimeout(() => {
                this.updateCursorInfo(e);
            }, 150); // Throttle cursor updates
        });

        // Focus/blur events for performance optimization
        this.editor.onDidFocusEditorWidget(() => {
            this.onEditorFocus();
        });

        this.editor.onDidBlurEditorWidget(() => {
            this.onEditorBlur();
        });

        // Scroll optimization with throttling
        let scrollTimeout;
        this.editor.onDidScrollChange((e) => {
            // Throttle scroll optimization to improve performance
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                this.optimizeScrollPerformance(e);
            }, 100); // Throttle scroll updates
        });
    }

    /**
     * Set up resize handling for better scroll behavior
     */
    setupResizeHandling() {
        if (!this.editor) return;

        // With automaticLayout: true, we only need minimal resize handling
        // Just set up tab change handling for proper resizing
        this.setupTabChangeHandling();
    }

    /**
     * Handle editor resize events
     */
    handleEditorResize() {
        // With automaticLayout: true, Monaco handles this automatically
        // Only manual layout call if really needed
        if (this.editor && this.isInitialized) {
            requestAnimationFrame(() => {
                this.editor.layout();
            });
        }
    }

    /**
     * Set up tab change handling for Monaco Editor
     */
    setupTabChangeHandling() {
        // Listen for tab changes to properly resize editor
        const tabButtons = document.querySelectorAll('[data-tab]');
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const targetTab = e.target.getAttribute('data-tab');
                if (targetTab === 'script' || targetTab === 'application') {
                    // Delay to allow tab transition
                    setTimeout(() => {
                        this.handleEditorResize();
                    }, 100);
                }
            });
        });
    }

    /**
     * Performance monitoring and optimization
     */
    setupPerformanceMonitoring() {
        let frameCount = 0;
        let lastTime = performance.now();

        const checkPerformance = () => {
            frameCount++;
            const currentTime = performance.now();

            if (currentTime - lastTime >= 1000) { // Check every second
                const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));

                if (fps < 30 && this.editor) {
                    console.warn('⚠️ Monaco Editor performance degraded, applying optimizations...');
                    this.applyPerformanceOptimizations();
                }

                frameCount = 0;
                lastTime = currentTime;
            }

            if (this.isInitialized) {
                requestAnimationFrame(checkPerformance);
            }
        };

        requestAnimationFrame(checkPerformance);
    }

    /**
     * Apply performance optimizations when needed
     */
    applyPerformanceOptimizations() {
        if (!this.editor) return;

        // Temporarily disable some features for better performance
        this.editor.updateOptions({
            minimap: { enabled: false },
            renderWhitespace: 'none',
            bracketPairColorization: { enabled: false },
            smoothScrolling: false
        });

        // Re-enable features after a delay
        setTimeout(() => {
            this.editor.updateOptions({
                minimap: { enabled: true },
                renderWhitespace: 'selection',
                bracketPairColorization: { enabled: true },
                smoothScrolling: true
            });
        }, 2000);
    }

    /**
     * Optimize scroll performance
     */
    optimizeScrollPerformance(scrollEvent) {
        // Implement virtual scrolling for large files
        const model = this.editor.getModel();
        if (model && model.getLineCount() > 1000) {
            // Enable virtual scrolling optimizations
            this.editor.updateOptions({
                stopRenderingLineAfter: 1000,
                renderValidationDecorations: 'off'
            });
        }
    }

    /**
     * Handle editor focus events
     */
    onEditorFocus() {
        // Enable full feature set when focused
        if (this.editor) {
            this.editor.updateOptions({
                renderValidationDecorations: 'on',
                quickSuggestions: {
                    other: true,
                    comments: false,
                    strings: false
                }
            });
        }
    }

    /**
     * Handle editor blur events
     */
    onEditorBlur() {
        // Reduce resource usage when not focused
        if (this.editor) {
            this.editor.updateOptions({
                renderValidationDecorations: 'off',
                quickSuggestions: false
            });
        }
    }

    /**
     * Update cursor information
     */
    updateCursorInfo(event) {
        const position = event.position;
        const model = this.editor.getModel();

        if (model) {
            const lineContent = model.getLineContent(position.lineNumber);
            const wordAtPosition = model.getWordAtPosition(position);

            // Store cursor info for debugging but don't log constantly
            this.lastCursorInfo = {
                line: position.lineNumber,
                column: position.column,
                word: wordAtPosition?.word
            };

            // Only log if debug mode is specifically enabled
            if (window.DEBUG_MONACO_CURSOR) {
                console.debug('Cursor at:', this.lastCursorInfo);
            }
        }
    }

    /**
     * Load initial JavaScript template with helpful starter code
     */
    loadInitialTemplate() {
        let initialCode;

        if (window.SCRIPT_TEMPLATES && window.SCRIPT_TEMPLATES.API_BASE_TEMPLATE) {
            initialCode = window.SCRIPT_TEMPLATES.API_BASE_TEMPLATE.code;
        } else {
            // Fallback to a comprehensive JavaScript starter template
            initialCode = `/**
 * JavaScript Code Editor
 * 
 * Features available:
 * - IntelliSense and autocomplete (Ctrl+Space)
 * - Code formatting (Ctrl+Shift+F)
 * - Line commenting (Ctrl+/)
 * - Duplicate line (Ctrl+Shift+D)
 * - Move line up/down (Alt+↑/↓)
 * - Multi-cursor editing (Alt+Click)
 * - Find and replace (Ctrl+F / Ctrl+H)
 * 
 * Snippets: Type 'log', 'func', 'arrow', 'tryc', 'async', 'class' + Tab
 */

// Example: Modern JavaScript function
const processData = async (data) => {
    try {
        console.log('Processing data:', data);
        
        // Your code here
        const result = data.map(item => ({
            ...item,
            processed: true,
            timestamp: new Date().toISOString()
        }));
        
        return result;
    } catch (error) {
        console.error('Error processing data:', error);
        throw error;
    }
};

// Example: Class with modern JavaScript features
class DataProcessor {
    constructor(options = {}) {
        this.options = {
            debug: false,
            timeout: 5000,
            ...options
        };
    }
    
    async process(input) {
        if (this.options.debug) {
            console.log('Processing input:', input);
        }
        
        // Implementation here
        return input;
    }
}

// Example usage
const processor = new DataProcessor({ debug: true });

// Start coding below this line
console.log('Ready to code JavaScript! 🚀');
`;
        }

        this.setValue(initialCode);
    }

    /**
     * Set editor value with dynamic height update
     */
    setValue(value) {
        if (this.editor && typeof value === 'string') {
            this.editor.setValue(value);

            // Update height after content is set
            setTimeout(() => {
                this.updateDynamicHeight();
            }, 100);

            // Focus editor and position cursor at the end
            this.editor.focus();
            const model = this.editor.getModel();
            if (model) {
                const lastLine = model.getLineCount();
                const lastColumn = model.getLineMaxColumn(lastLine);
                this.editor.setPosition({ lineNumber: lastLine, column: lastColumn });
            }
        }
    }

    /**
     * Get editor value with optional validation
     */
    getValue(validate = false) {
        const value = this.editor ? this.editor.getValue() : '';

        if (validate) {
            this.validateJavaScript(value);
        }

        return value;
    }

    /**
     * Validate JavaScript code for common errors
     */
    validateJavaScript(code) {
        try {
            // Basic syntax validation using Function constructor
            new Function(code);
            this.clearValidationErrors();
            return true;
        } catch (error) {
            this.showValidationError(error);
            return false;
        }
    }

    /**
     * Show validation error in editor
     */
    showValidationError(error) {
        if (!this.editor) return;

        // Extract line number from error if possible
        const lineMatch = error.message.match(/line (\d+)/);
        const lineNumber = lineMatch ? parseInt(lineMatch[1]) : 1;

        // Add error marker
        const model = this.editor.getModel();
        if (model) {
            monaco.editor.setModelMarkers(model, 'javascript-validation', [{
                startLineNumber: lineNumber,
                endLineNumber: lineNumber,
                startColumn: 1,
                endColumn: model.getLineMaxColumn(lineNumber),
                message: error.message,
                severity: monaco.MarkerSeverity.Error
            }]);
        }

        console.warn('JavaScript validation error:', error.message);
    }

    /**
     * Clear validation errors
     */
    clearValidationErrors() {
        if (!this.editor) return;

        const model = this.editor.getModel();
        if (model) {
            monaco.editor.setModelMarkers(model, 'javascript-validation', []);
        }
    }

    /**
     * Insert text at cursor position
     */
    insertText(text) {
        if (this.editor) {
            const selection = this.editor.getSelection();
            const op = { range: selection, text: text, forceMoveMarkers: true };
            this.editor.executeEdits('insert-text', [op]);
            this.editor.focus();
        }
    }

    /**
     * Format code
     */
    async formatCode() {
        if (this.editor) {
            await this.editor.getAction('editor.action.formatDocument').run();
        }
    }

    /**
     * Toggle theme
     */
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'vs-dark' ? 'vs-light' : 'vs-dark';
        monaco.editor.setTheme(this.currentTheme);
    }

    /**
     * Dispose editor and cleanup
     */
    dispose() {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }

        if (this.editor) {
            this.editor.dispose();
        }

        this.isInitialized = false;
    }

    /**
     * Get editor instance
     */
    getEditor() {
        return this.editor;
    }

    /**
     * Check if editor is ready
     */
    isReady() {
        return this.isInitialized && this.editor;
    }

    /**
     * Manually trigger height update (for external calls)
     */
    refreshHeight() {
        this.updateDynamicHeight();
    }

    /**
     * Get current content height with safe calculation
     */
    getContentHeight() {
        if (!this.editor) return 0;

        const model = this.editor.getModel();
        if (!model) return 0;

        const lineCount = model.getLineCount();
        const lineHeight = this.getLineHeightSafe();

        return Math.ceil(lineCount * lineHeight) + 40;
    }

    /**
     * Performance monitoring and debugging
     */
    getPerformanceInfo() {
        if (!this.editor) return null;

        const model = this.editor.getModel();
        return {
            lineCount: model ? model.getLineCount() : 0,
            currentPosition: this.lastCursorInfo || null,
            isInitialized: this.isInitialized,
            memoryUsage: performance.memory ? {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + 'MB',
                total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024) + 'MB'
            } : 'N/A',
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Enable/disable debug mode for cursor tracking
     */
    setDebugMode(enabled) {
        window.DEBUG_MONACO_CURSOR = enabled;
        console.log(`Monaco cursor debug mode: ${enabled ? 'enabled' : 'disabled'}`);
    }
}

// Global Monaco Editor Manager instance
window.MonacoManager = new MonacoEditorManager();

// Global helper functions for debugging and height management
window.monacoDebug = {
    enableCursorDebug: () => window.MonacoManager.setDebugMode(true),
    disableCursorDebug: () => window.MonacoManager.setDebugMode(false),
    getPerformanceInfo: () => window.MonacoManager.getPerformanceInfo(),
    getCursorInfo: () => window.MonacoManager.lastCursorInfo || 'No cursor info available',
    logPerformance: () => {
        const info = window.MonacoManager.getPerformanceInfo();
        console.table(info);
        return info;
    },
    refreshHeight: () => window.MonacoManager.refreshHeight(),
    getContentHeight: () => window.MonacoManager.getContentHeight(),
    forceHeightUpdate: () => {
        console.log('🔄 Forcing height update...');
        window.MonacoManager.refreshHeight();
    }
};

console.log('🚀 Monaco Debug Tools available:', Object.keys(window.monacoDebug));

// Initialize when Monaco is available
if (typeof monaco !== 'undefined') {
    window.MonacoManager.initialize().then(editor => {
        window.monacoEditor = editor;
        console.log('✅ Monaco Editor ready with optimizations');
    });
}

// Initialize Monaco Editor with optimized configuration
require.config({
    paths: { 'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.44.0/min/vs' }
});

require(['vs/editor/editor.main'], function () {
    // Initialize using the optimized Monaco Manager
    if (window.MonacoManager) {
        window.MonacoManager.initialize().then(editor => {
            window.monacoEditor = editor;
            console.log('✅ Monaco Editor ready with scroll optimizations');
        }).catch(error => {
            console.error('❌ Failed to initialize Monaco Editor:', error);
        });
    } else {
        console.error('❌ Monaco Manager not loaded');
    }
});