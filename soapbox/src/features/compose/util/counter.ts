import { urlRegex } from './url-regex.ts';

const urlPlaceholder = 'xxxxxxxxxxxxxxxxxxxxxxx';

export function countableText(inputText: string) {
  return inputText
    .replace(urlRegex, urlPlaceholder)
    .replace(/(^|[^/\w])@(([a-z0-9_]+)@[a-z0-9.-]+[a-z0-9]+)/ig, '$1@$3');
}
