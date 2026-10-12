export default function() {

  const links = document.querySelectorAll('a.js-email:not([href])');

  links.forEach((link) => {
    const { user, domain, tld } = link.dataset;
    const address = `${user}@${domain}.${tld}`;

    link.href = `mailto:${address}`;

    if (link.textContent.includes('[at]')) {
      link.textContent = address;
    }
  });

}
