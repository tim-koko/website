{{- partial "llm/frontmatter.md" . }}
# {{ .Title }}
{{ with .Params.lead }}
> {{ . | plainify | htmlUnescape }}
{{ end }}
{{- with .Params.abstract }}
{{ .text | plainify | htmlUnescape }}
{{ range .list }}
- {{ . }}
{{- end }}
{{ end }}
{{ partial "llm/content.md" . }}
{{- with .Params.faq }}

## {{ i18n "faqTitle" }}
{{ $base := strings.TrimSuffix "/" ("/" | absURL) }}
{{- range . }}
### {{ .question }}

{{ .answer | replaceRE `\]\((/[^)]*)\)` (printf "](%s${1})" $base) }}
{{ end }}
{{- end }}
