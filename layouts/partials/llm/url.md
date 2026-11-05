{{- /* URL of the Markdown version of a page, falling back to the HTML version. */ -}}
{{- $url := .Permalink -}}
{{- with .OutputFormats.Get "markdown" -}}{{- $url = .Permalink -}}{{- end -}}
{{- return $url -}}
