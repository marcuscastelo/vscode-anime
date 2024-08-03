import { Err, Ok, Result } from "rustic";

export function isValidDate(date: string): boolean {
    return date.match(/^\d{2}\/\d{2}\/\d{4}$/) !== null;
}

export function isValidTime(time: string): boolean {
    return time.match(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/) !== null;
}

export function ddmmyyyToDate(dateString: string): Result<Date, Error> {
    if (!isValidDate(dateString)) {
        return Err(new Error('Invalid date format'));
    }

    const [day, month, year] = dateString.split('/');
    return Ok(new Date(+year, +month - 1, +day));
}
