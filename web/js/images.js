import { artwork, sprite, loadFormSprite } from './data.js';
import { escapeHTML } from './presentation.js';

// A imagem usa o ID da variedade; formas cosméticas podem exigir metadados próprios.
const placeholder = new URL('../icon.svg', import.meta.url).href;
export function imageMarkup(
  form,
  { catalog, shiny, className = '', eager = false },
) {
  const cosmetic =
    !form.default &&
    catalog.some(
      (candidate) =>
        candidate.pokemon === form.pokemon && candidate.id !== form.id,
    );
  const pending = cosmetic && shiny;
  const label = `${form.label}${shiny ? ' shiny' : ''}`;
  const alternativeText = pending
    ? 'Carregando ' + label
    : cosmetic
      ? 'Referência da variedade: ' + label
      : label;
  const attributes = [
    `class="${className}"`,
    `src="${pending ? placeholder : artwork(form, shiny)}"`,
    `data-pokemon="${form.pokemon}"`,
    `data-shiny="${Number(shiny)}"`,
    `data-image-label="${escapeHTML(label)}"`,
    cosmetic ? `data-form-image="${form.id}"` : '',
    `alt="${escapeHTML(alternativeText)}"`,
    pending ? 'style="opacity:.25"' : '',
    'width="280" height="280"',
    eager ? 'fetchpriority="high"' : 'loading="lazy"',
    'decoding="async"',
  ].join(' ');
  const pendingCaption =
    pending && !className
      ? '<span class="image-unavailable">Carregando shiny…</span>'
      : '';
  return `<img ${attributes}>${pendingCaption}`;
}

export function imageCaption(image, message) {
  let caption = image.parentElement.querySelector(
    '.image-caption, .image-unavailable',
  );
  if (!caption) {
    caption = document.createElement('span');
    caption.className = 'image-unavailable';
    image.after(caption);
  }
  caption.textContent = message;
}

export function unavailableImage(image) {
  const message =
    image.dataset.shiny === '1'
      ? 'Imagem shiny indisponível'
      : 'Imagem indisponível';
  image.dataset.fallback = '2';
  image.src = placeholder;
  image.alt = message;
  image.style.opacity = '.25';
  imageCaption(image, message);
}

export async function resolveFormImage(image) {
  const shiny = image.dataset.shiny === '1';
  const source = await loadFormSprite(Number(image.dataset.formImage), shiny);
  // Uma troca de forma ou aparência remove a imagem anterior do documento.
  if (!image.isConnected) {
    return;
  }
  if (source) {
    image.dataset.exactForm = '1';
    delete image.dataset.fallback;
    image.style.opacity = '';
    image.alt = image.dataset.imageLabel;
    image.src = source;
    imageCaption(
      image,
      image.classList.contains('detail-image')
        ? `Sprite da forma selecionada${shiny ? ' · Shiny' : ''}`
        : '',
    );
  } else if (shiny) {
    unavailableImage(image);
  } else {
    imageCaption(
      image,
      'Referência da variedade; sprite desta forma indisponível.',
    );
  }
}

// Cada erro avança apenas uma etapa: ilustração → sprite → indisponível.
export function handleImageError(event) {
  const image = event.target;
  if (!(image instanceof HTMLImageElement) || !image.dataset.pokemon) {
    return;
  }
  if (image.dataset.fallback === '2') {
    return;
  }
  if (image.dataset.shiny === '1' && image.dataset.exactForm) {
    unavailableImage(image);
  } else if (!image.dataset.fallback) {
    image.dataset.fallback = '1';
    image.src = sprite(
      { pokemon: image.dataset.pokemon },
      image.dataset.shiny === '1',
    );
  } else {
    unavailableImage(image);
  }
}
