const cookie = {
    read(name: string): string | null {
        // 正则含义：
        // 相当于reg = /(^|;\s*)(name)=([^;]*)/
        // 即cookie项是要么在开头或者是分号后面开始，包含名称=xxxx的形式，=号后面跟着0个或多个非分号
        const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));

        // 一个括号代表一个正则匹配项。match[0]代表整个匹配结果。那么name对应的内容，是在match[3]匹配项内
        return match ? decodeURIComponent(match[3]) : null;
    },
}

export default cookie;