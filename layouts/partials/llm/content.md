{{- /*
  Returns the raw Markdown content of a page, cleaned up for AI agents:
  shortcodes are resolved or removed, inline SVGs and layout-only HTML are
  stripped and relative links are made absolute.
*/ -}}
{{- $c := .RawContent -}}

{{- /* Resolve ref/relref shortcodes to absolute URLs */ -}}
{{- range findRESubmatch `\{\{[<%]\s*(?:rel)?ref\s+(?:path=)?"([^"#]*)(#[^"]*)?"(?:\s+lang="([^"]+)")?\s*[>%]\}\}` $c -}}
  {{- $m := . -}}
  {{- $lang := index $m 3 -}}
  {{- $url := "" -}}
  {{- with site.GetPage (index $m 1) -}}
    {{- $p := . -}}
    {{- if and $lang (ne $lang $p.Lang) -}}
      {{- range $p.Translations -}}
        {{- if eq .Lang $lang -}}{{- $p = . -}}{{- end -}}
      {{- end -}}
    {{- end -}}
    {{- $url = printf "%s%s" $p.Permalink (index $m 2) -}}
  {{- end -}}
  {{- $c = replace $c (index $m 0) $url -}}
{{- end -}}

{{- /* Shortcodes with useful parameters */ -}}
{{- $c = replaceRE `\{\{<\s*accordion-item\s+title="([^"]*)"[^}]*>\}\}` "\n**${1}**\n\n" $c -}}
{{- $c = replaceRE `(?s)\{\{<\s*infobox\s.*?\btitle="([^"]*)".*?>\}\}` "\n### ${1}\n\n" $c -}}
{{- $c = replaceRE `\{\{<\s*csvtable[^}]*>\}\}` "\n```csv" $c -}}
{{- $c = replaceRE `\{\{<\s*/csvtable\s*>\}\}` "```\n" $c -}}
{{- $c = replaceRE `\{\{<\s*youtube\s+(?:id=)?"?([\w-]+)"?[^}]*>\}\}` "[YouTube-Video](https://www.youtube.com/watch?v=${1})" $c -}}

{{- /* Remove all remaining shortcode tags (inner content is kept) */ -}}
{{- $c = replaceRE `(?s)\{\{[<%].*?[>%]\}\}` "" $c -}}

{{- /* Strip layout-only HTML */ -}}
{{- $c = replaceRE `(?s)<svg.*?</svg>` "" $c -}}
{{- $c = replaceRE `<br\s*/?>|</br>` " " $c -}}
{{- $c = replace $c "&nbsp;" "" -}}
{{- $c = replaceRE `\s+style="[^"]*"` "" $c -}}
{{- $c = replaceRE `(?s)<a\s[^>]*?href="([^"]*)"[^>]*>(.*?)</a>` "[${2}](${1})" $c -}}

{{- /* Make site-relative links absolute */ -}}
{{- $base := strings.TrimSuffix "/" ("/" | absURL) -}}
{{- $c = replaceRE `\]\((/[^)]*)\)` (printf "](%s${1})" $base) $c -}}

{{- /* Tidy up whitespace */ -}}
{{- $c = replaceRE `(?m)^[ \t]+$` "" $c -}}
{{- $c = replaceRE `\n{3,}` "\n\n" $c -}}

{{- return (strings.TrimSpace $c) -}}
