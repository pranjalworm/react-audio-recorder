.PHONY: install dev build preview

install:
	pnpm install

dev:
	pnpm dev

build:
	pnpm build

preview: build
	pnpm preview
